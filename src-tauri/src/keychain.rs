//! keychain.rs — macOS Keychain bridge with a Touch ID / password gate.
//!
//! Design note: biometric-ACL keychain items (`kSecAttrAccessControl`) require
//! the app to be signed with a `keychain-access-groups` entitlement, which
//! `tauri dev` never applies (the binary is unsigned/ad-hoc) — `SecItemAdd`
//! then fails with errSecMissingEntitlement (-34018). So instead we store the
//! secret in the plain login keychain (works signed *and* in dev) and gate
//! reads with LocalAuthentication (`LAContext`): the system Touch-ID-or-password
//! sheet. Result: the requested "finger or password" UX, testable in dev.
//!
//! One item per vault (account = container path) holds a small JSON blob with
//! the unlock secret and, optionally, the HMAC integrity password — so a single
//! biometric prompt returns everything needed to open the vault.

use serde::{Deserialize, Serialize};

/// App-wide keychain service. Accounts are per-container paths.
#[cfg(target_os = "macos")]
const SERVICE: &str = "tech.nldev.tvault-client.vault";

/// Everything needed to open a vault, returned after one biometric prompt.
#[derive(Serialize)]
pub struct KeychainSecret {
    /// The main unlock secret: password, master token, or shares joined by "|".
    pub secret: String,
    /// The HMAC integrity password, if the vault has one and it was saved.
    pub hmac: Option<String>,
}

/* ─────────── Tauri commands (cross-platform surface) ─────────── */

#[tauri::command]
pub fn keychain_available() -> bool {
    cfg!(target_os = "macos")
}

#[tauri::command]
pub fn keychain_set(
    account: String,
    secret: String,
    hmac: Option<String>,
) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos::set(SERVICE, &account, &secret, hmac.as_deref())
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (account, secret, hmac);
        Err("keychain is only available on macOS".into())
    }
}

/// Async: the LocalAuthentication sheet runs on a dedicated thread so it never
/// blocks the main thread while the user authenticates.
#[tauri::command]
pub async fn keychain_get(account: String, prompt: String) -> Result<KeychainSecret, String> {
    #[cfg(target_os = "macos")]
    {
        let (tx, rx) = tokio::sync::oneshot::channel();
        std::thread::spawn(move || {
            let _ = tx.send(macos::get(SERVICE, &account, &prompt));
        });
        rx.await.map_err(|e| e.to_string())?
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (account, prompt);
        Err("keychain is only available on macOS".into())
    }
}

#[tauri::command]
pub fn keychain_has(account: String) -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::has(SERVICE, &account)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = account;
        false
    }
}

#[tauri::command]
pub fn keychain_delete(account: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos::delete(SERVICE, &account)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = account;
        Ok(())
    }
}

/// Best-effort account rename, used when a vault file is moved during reseal.
#[tauri::command]
pub fn keychain_move(from: String, to: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos::rename(SERVICE, &from, &to)
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (from, to);
        Ok(())
    }
}

/// On-disk shape of the stored blob. `hmac` defaults to None for older items
/// and for vaults without integrity.
#[derive(Serialize, Deserialize)]
struct StoredBlob {
    secret: String,
    #[serde(default)]
    hmac: Option<String>,
}

/* ─────────── macOS implementation ─────────── */

#[cfg(target_os = "macos")]
mod macos {
    use std::ptr;
    use std::sync::mpsc;
    use std::sync::Mutex;

    use block2::RcBlock;
    use core_foundation::base::{CFType, TCFType};
    use core_foundation::boolean::CFBoolean;
    use core_foundation::data::CFData;
    use core_foundation::dictionary::CFDictionary;
    use core_foundation::string::CFString;
    use core_foundation_sys::base::CFTypeRef;
    use core_foundation_sys::data::CFDataRef;
    use core_foundation_sys::dictionary::CFDictionaryRef;
    use core_foundation_sys::string::CFStringRef;
    use objc2::runtime::Bool;
    use objc2_foundation::{NSError, NSString};
    use objc2_local_authentication::{LAContext, LAPolicy};

    use super::{KeychainSecret, StoredBlob};

    type OSStatus = i32;

    const ERR_SEC_SUCCESS: OSStatus = 0;
    const ERR_SEC_ITEM_NOT_FOUND: OSStatus = -25300;

    #[allow(non_upper_case_globals)]
    #[link(name = "Security", kind = "framework")]
    extern "C" {
        static kSecClass: CFStringRef;
        static kSecClassGenericPassword: CFStringRef;
        static kSecAttrService: CFStringRef;
        static kSecAttrAccount: CFStringRef;
        static kSecValueData: CFStringRef;
        static kSecReturnData: CFStringRef;
        static kSecReturnAttributes: CFStringRef;
        static kSecMatchLimit: CFStringRef;
        static kSecMatchLimitOne: CFStringRef;

        fn SecItemAdd(attributes: CFDictionaryRef, result: *mut CFTypeRef) -> OSStatus;
        fn SecItemCopyMatching(query: CFDictionaryRef, result: *mut CFTypeRef) -> OSStatus;
        fn SecItemUpdate(query: CFDictionaryRef, attributes_to_update: CFDictionaryRef)
            -> OSStatus;
        fn SecItemDelete(query: CFDictionaryRef) -> OSStatus;
    }

    /// Wrap a borrowed global CFString constant as an owned `CFType` (get rule).
    unsafe fn borrowed(s: CFStringRef) -> CFType {
        CFString::wrap_under_get_rule(s).as_CFType()
    }

    fn base_query(service: &str, account: &str) -> Vec<(CFType, CFType)> {
        unsafe {
            vec![
                (borrowed(kSecClass), borrowed(kSecClassGenericPassword)),
                (borrowed(kSecAttrService), CFString::new(service).as_CFType()),
                (borrowed(kSecAttrAccount), CFString::new(account).as_CFType()),
            ]
        }
    }

    /// Present the Touch ID / device-password sheet. `Err("cancelled")` when the
    /// user dismisses it (so the UI silently falls back to manual entry).
    fn authenticate(reason: &str) -> Result<(), String> {
        let ctx = unsafe { LAContext::new() };
        let policy = LAPolicy::DeviceOwnerAuthentication; // biometry OR device password
        if unsafe { ctx.canEvaluatePolicy_error(policy) }.is_err() {
            return Err("biometrics or device password is not available".into());
        }

        let reason_ns = NSString::from_str(reason);
        let (tx, rx) = mpsc::channel::<Result<(), String>>();
        let tx = Mutex::new(Some(tx));
        let block = RcBlock::new(move |success: Bool, error: *mut NSError| {
            let result = if success.as_bool() {
                Ok(())
            } else if error.is_null() {
                Err("cancelled".into())
            } else {
                let code = unsafe { &*error }.code();
                match code {
                    // userCancel / userFallback / systemCancel / appCancel /
                    // authenticationFailed → treat as a dismissal.
                    -1 | -2 | -3 | -4 | -9 => Err("cancelled".into()),
                    other => Err(format!("authentication failed ({other})")),
                }
            };
            if let Some(tx) = tx.lock().unwrap().take() {
                let _ = tx.send(result);
            }
        });

        unsafe {
            ctx.evaluatePolicy_localizedReason_reply(policy, &reason_ns, &block);
        }
        rx.recv()
            .unwrap_or_else(|_| Err("authentication was interrupted".into()))
    }

    pub fn set(
        service: &str,
        account: &str,
        secret: &str,
        hmac: Option<&str>,
    ) -> Result<(), String> {
        // Overwrite: the item is unique per (service, account).
        let _ = delete(service, account);

        let blob = StoredBlob {
            secret: secret.to_string(),
            hmac: hmac.map(|s| s.to_string()),
        };
        let payload =
            serde_json::to_string(&blob).map_err(|e| format!("failed to encode secret: {e}"))?;

        let data = CFData::from_buffer(payload.as_bytes());
        let mut pairs = base_query(service, account);
        unsafe {
            pairs.push((borrowed(kSecValueData), data.as_CFType()));
        }
        let dict = CFDictionary::from_CFType_pairs(&pairs);

        let status = unsafe { SecItemAdd(dict.as_concrete_TypeRef(), ptr::null_mut()) };
        if status == ERR_SEC_SUCCESS {
            Ok(())
        } else {
            Err(format!("keychain add failed ({status})"))
        }
    }

    pub fn get(service: &str, account: &str, prompt: &str) -> Result<KeychainSecret, String> {
        // Nothing to unlock if the item is gone — check before prompting.
        if !has(service, account) {
            return Err("keychain item not found".into());
        }
        authenticate(prompt)?;

        let raw = read_data(service, account)?;
        // Current items are a JSON blob; tolerate a legacy raw-string item.
        match serde_json::from_str::<StoredBlob>(&raw) {
            Ok(blob) => Ok(KeychainSecret {
                secret: blob.secret,
                hmac: blob.hmac,
            }),
            Err(_) => Ok(KeychainSecret {
                secret: raw,
                hmac: None,
            }),
        }
    }

    fn read_data(service: &str, account: &str) -> Result<String, String> {
        let mut pairs = base_query(service, account);
        unsafe {
            pairs.push((borrowed(kSecReturnData), CFBoolean::true_value().as_CFType()));
            pairs.push((borrowed(kSecMatchLimit), borrowed(kSecMatchLimitOne)));
        }
        let dict = CFDictionary::from_CFType_pairs(&pairs);

        let mut result: CFTypeRef = ptr::null();
        let status = unsafe { SecItemCopyMatching(dict.as_concrete_TypeRef(), &mut result) };
        match status {
            ERR_SEC_SUCCESS => {
                if result.is_null() {
                    return Err("keychain returned no data".into());
                }
                let data = unsafe { CFData::wrap_under_create_rule(result as CFDataRef) };
                String::from_utf8(data.bytes().to_vec())
                    .map_err(|e| format!("keychain data is not valid utf-8: {e}"))
            }
            ERR_SEC_ITEM_NOT_FOUND => Err("keychain item not found".into()),
            other => Err(format!("keychain read failed ({other})")),
        }
    }

    /// Existence check — never reads the data, so it never prompts.
    pub fn has(service: &str, account: &str) -> bool {
        let mut pairs = base_query(service, account);
        unsafe {
            pairs.push((
                borrowed(kSecReturnAttributes),
                CFBoolean::true_value().as_CFType(),
            ));
            pairs.push((borrowed(kSecMatchLimit), borrowed(kSecMatchLimitOne)));
        }
        let dict = CFDictionary::from_CFType_pairs(&pairs);

        let mut result: CFTypeRef = ptr::null();
        let status = unsafe { SecItemCopyMatching(dict.as_concrete_TypeRef(), &mut result) };
        if !result.is_null() {
            let _ = unsafe { CFType::wrap_under_create_rule(result) };
        }
        status == ERR_SEC_SUCCESS
    }

    pub fn delete(service: &str, account: &str) -> Result<(), String> {
        let dict = CFDictionary::from_CFType_pairs(&base_query(service, account));
        let status = unsafe { SecItemDelete(dict.as_concrete_TypeRef()) };
        if status == ERR_SEC_SUCCESS || status == ERR_SEC_ITEM_NOT_FOUND {
            Ok(())
        } else {
            Err(format!("keychain delete failed ({status})"))
        }
    }

    /// Rename the account attribute when a vault file is moved.
    pub fn rename(service: &str, from: &str, to: &str) -> Result<(), String> {
        if from == to {
            return Ok(());
        }
        let query = CFDictionary::from_CFType_pairs(&base_query(service, from));
        let update = unsafe {
            CFDictionary::from_CFType_pairs(&[(
                borrowed(kSecAttrAccount),
                CFString::new(to).as_CFType(),
            )])
        };
        let status =
            unsafe { SecItemUpdate(query.as_concrete_TypeRef(), update.as_concrete_TypeRef()) };
        if status == ERR_SEC_SUCCESS || status == ERR_SEC_ITEM_NOT_FOUND {
            Ok(())
        } else {
            Err(format!("keychain move failed ({status})"))
        }
    }
}
