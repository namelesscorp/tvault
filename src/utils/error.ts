import type { TvaultError } from "interfaces";

// Error codes from tvault-core
const ErrorCodes = {
	// Container errors
	ErrCodeContainerCurrentPathRequired: 0x000,
	ErrCodeContainerNewPathRequired: 0x001,
	ErrCodeContainerFolderPathRequired: 0x002,
	ErrCodeContainerPassphraseRequired: 0x003,
	ErrCodeContainerOpenFileError: 0x043,

	// Compression errors
	ErrCodeCompressionTypeInvalid: 0x004,

	// Integrity errors
	ErrCodeIntegrityProviderTypeInvalid: 0x005,
	ErrCodeIntegrityProviderNewPassphraseRequired: 0x006,

	// Shamir errors
	ErrCodeShamirSharesEqualZero: 0x007,
	ErrCodeShamirThresholdEqualZero: 0x008,
	ErrCodeShamirSharesLessThanThreshold: 0x009,
	ErrCodeShamirSharesLessThanTwo: 0x010,
	ErrCodeShamirThresholdLessThanTwo: 0x011,
	ErrCodeShamirSharesGreaterThan255: 0x012,
	ErrCodeShamirThresholdGreaterThan255: 0x013,

	// Token errors
	ErrCodeTokenWriterTypeInvalid: 0x014,
	ErrCodeTokenWriterPathRequired: 0x015,
	ErrCodeTokenWriterFormatInvalid: 0x016,
	ErrCodeTokenReaderTypeInvalid: 0x017,
	ErrCodeTokenReaderFlagRequired: 0x018,
	ErrCodeTokenReaderPathRequired: 0x019,
	ErrCodeTokenReaderFormatInvalid: 0x020,
	ErrCodeTokenTypeInvalid: 0x102,

	// Unseal errors
	ErrCodeUnsealOpenContainerError: 0x064,
	ErrCodeUnsealGetTokenStringError: 0x065,
	ErrCodeUnsealParseTokensError: 0x066,
	ErrCodeUnsealRestoreMasterKeyError: 0x067,
	ErrCodeUnsealContainerError: 0x068,
	ErrCodeUnsealUnpackContentError: 0x069,
	ErrCodeUnsealGetReaderError: 0x070,
	ErrCodeUnsealReadAllError: 0x071,
	ErrCodeUnsealInvalidTokenFormatError: 0x072,
	ErrCodeUnsealUnmarshalTokenListError: 0x073,
	ErrCodeUnsealParseTokenError: 0x074,
	ErrCodeUnsealDecodeMasterKeyError: 0x075,
	ErrCodeUnsealDecodeShareValueError: 0x076,
	ErrCodeUnsealDecodeShareSignatureError: 0x077,
	ErrCodeUnsealCompressionUnpackError: 0x078,

	// Seal errors
	ErrCodeSealCompressFolderError: 0x079,
	ErrCodeSealCreateContainerError: 0x080,
	ErrCodeSealCreateIntegrityProviderError: 0x081,
	ErrCodeSealDeriveIntegrityProviderPassphraseError: 0x082,
	ErrCodeSealGenerateAndSaveTokensError: 0x083,
	ErrCodeSealCompressionPackError: 0x084,
	ErrCodeSealCreateContainerHeaderError: 0x085,
	ErrCodeSealEncryptContainerError: 0x086,
	ErrCodeSealWriteContainerError: 0x087,
	ErrCodeSealShamirSplitError: 0x088,
	ErrCodeSealWriteTokensShareError: 0x089,
	ErrCodeSealBuildShareTokenError: 0x090,
	ErrCodeSealWriteTokenMasterError: 0x091,
	ErrCodeSealBuildMasterTokenError: 0x092,

	// Reseal errors
	ErrCodeResealOpenContainerError: 0x093,
	ErrCodeResealGetTokenStringError: 0x094,
	ErrCodeResealParseTokensError: 0x095,
	ErrCodeResealRestoreMasterKeyError: 0x096,
	ErrCodeResealCompressFolderError: 0x097,
	ErrCodeResealEncryptContainerError: 0x098,
	ErrCodeResealWriteContainerError: 0x099,
	ErrCodeResealCreateIntegrityProviderError: 0x100,
	ErrCodeResealDeriveAdditionalPasswordError: 0x101,

	// Info errors
	ErrCodeInfoWriterTypeInvalid: 0x105,
	ErrCodeInfoWriterPathRequired: 0x106,
	ErrCodeInfoWriterFormatInvalid: 0x107,
	ErrCodeInfoPathRequired: 0x108,
} as const;

// Mapping of error codes to human-readable messages
const ErrorMessages: Record<number, string> = {
	[ErrorCodes.ErrCodeContainerCurrentPathRequired]:
		"Не указан путь к текущему контейнеру",
	[ErrorCodes.ErrCodeContainerNewPathRequired]:
		"Не указан путь для нового контейнера",
	[ErrorCodes.ErrCodeContainerFolderPathRequired]: "Не указан путь к папке",
	[ErrorCodes.ErrCodeContainerPassphraseRequired]:
		"Не указан пароль контейнера",
	[ErrorCodes.ErrCodeContainerOpenFileError]:
		"Не удалось открыть файл контейнера",

	[ErrorCodes.ErrCodeCompressionTypeInvalid]: "Неверный тип сжатия",

	[ErrorCodes.ErrCodeIntegrityProviderTypeInvalid]:
		"Неверный тип провайдера целостности",
	[ErrorCodes.ErrCodeIntegrityProviderNewPassphraseRequired]:
		"Не указан новый пароль для проверки целостности",

	[ErrorCodes.ErrCodeShamirSharesEqualZero]:
		"Количество долей должно быть больше нуля",
	[ErrorCodes.ErrCodeShamirThresholdEqualZero]:
		"Порог должен быть больше нуля",
	[ErrorCodes.ErrCodeShamirSharesLessThanThreshold]:
		"Количество долей должно быть больше или равно порогу",
	[ErrorCodes.ErrCodeShamirSharesLessThanTwo]:
		"Количество долей должно быть не менее двух",
	[ErrorCodes.ErrCodeShamirThresholdLessThanTwo]:
		"Порог должен быть не менее двух",
	[ErrorCodes.ErrCodeShamirSharesGreaterThan255]:
		"Количество долей не может превышать 255",
	[ErrorCodes.ErrCodeShamirThresholdGreaterThan255]:
		"Порог не может превышать 255",

	[ErrorCodes.ErrCodeTokenWriterTypeInvalid]: "Неверный тип записи токенов",
	[ErrorCodes.ErrCodeTokenWriterPathRequired]:
		"Не указан путь для записи токенов",
	[ErrorCodes.ErrCodeTokenWriterFormatInvalid]:
		"Неверный формат записи токенов",
	[ErrorCodes.ErrCodeTokenReaderTypeInvalid]: "Неверный тип чтения токенов",
	[ErrorCodes.ErrCodeTokenReaderFlagRequired]:
		"Не указан флаг для чтения токенов",
	[ErrorCodes.ErrCodeTokenReaderPathRequired]:
		"Не указан путь для чтения токенов",
	[ErrorCodes.ErrCodeTokenReaderFormatInvalid]:
		"Неверный формат чтения токенов",
	[ErrorCodes.ErrCodeTokenTypeInvalid]: "Неверный тип токена",

	[ErrorCodes.ErrCodeUnsealOpenContainerError]:
		"Не удалось открыть контейнер",
	[ErrorCodes.ErrCodeUnsealGetTokenStringError]:
		"Не удалось получить строку токена",
	[ErrorCodes.ErrCodeUnsealParseTokensError]: "Не удалось разобрать токены",
	[ErrorCodes.ErrCodeUnsealRestoreMasterKeyError]:
		"Не удалось восстановить мастер-ключ",
	[ErrorCodes.ErrCodeUnsealContainerError]: "Ошибка при открытии контейнера",
	[ErrorCodes.ErrCodeUnsealUnpackContentError]:
		"Не удалось распаковать содержимое",
	[ErrorCodes.ErrCodeUnsealGetReaderError]: "Не удалось получить читатель",
	[ErrorCodes.ErrCodeUnsealReadAllError]: "Не удалось прочитать все данные",
	[ErrorCodes.ErrCodeUnsealInvalidTokenFormatError]: "Неверный формат токена",
	[ErrorCodes.ErrCodeUnsealUnmarshalTokenListError]:
		"Не удалось разобрать список токенов",
	[ErrorCodes.ErrCodeUnsealParseTokenError]: "Не удалось разобрать токен",
	[ErrorCodes.ErrCodeUnsealDecodeMasterKeyError]:
		"Не удалось декодировать мастер-ключ",
	[ErrorCodes.ErrCodeUnsealDecodeShareValueError]:
		"Не удалось декодировать значение доли",
	[ErrorCodes.ErrCodeUnsealDecodeShareSignatureError]:
		"Не удалось декодировать подпись доли",
	[ErrorCodes.ErrCodeUnsealCompressionUnpackError]:
		"Не удалось распаковать сжатые данные",

	[ErrorCodes.ErrCodeSealCompressFolderError]: "Не удалось сжать папку",
	[ErrorCodes.ErrCodeSealCreateContainerError]:
		"Не удалось создать контейнер",
	[ErrorCodes.ErrCodeSealCreateIntegrityProviderError]:
		"Не удалось создать провайдер целостности",
	[ErrorCodes.ErrCodeSealDeriveIntegrityProviderPassphraseError]:
		"Не удалось вывести пароль провайдера целостности",
	[ErrorCodes.ErrCodeSealGenerateAndSaveTokensError]:
		"Не удалось сгенерировать и сохранить токены",
	[ErrorCodes.ErrCodeSealCompressionPackError]:
		"Не удалось упаковать сжатые данные",
	[ErrorCodes.ErrCodeSealCreateContainerHeaderError]:
		"Не удалось создать заголовок контейнера",
	[ErrorCodes.ErrCodeSealEncryptContainerError]:
		"Не удалось зашифровать контейнер",
	[ErrorCodes.ErrCodeSealWriteContainerError]:
		"Не удалось записать контейнер",
	[ErrorCodes.ErrCodeSealShamirSplitError]:
		"Не удалось разделить ключ по схеме Шамира",
	[ErrorCodes.ErrCodeSealWriteTokensShareError]:
		"Не удалось записать токены долей",
	[ErrorCodes.ErrCodeSealBuildShareTokenError]:
		"Не удалось создать токен доли",
	[ErrorCodes.ErrCodeSealWriteTokenMasterError]:
		"Не удалось записать мастер-токен",
	[ErrorCodes.ErrCodeSealBuildMasterTokenError]:
		"Не удалось создать мастер-токен",

	[ErrorCodes.ErrCodeResealOpenContainerError]:
		"Не удалось открыть контейнер для перепаковки",
	[ErrorCodes.ErrCodeResealGetTokenStringError]:
		"Не удалось получить строку токена при перепаковке",
	[ErrorCodes.ErrCodeResealParseTokensError]:
		"Не удалось разобрать токены при перепаковке",
	[ErrorCodes.ErrCodeResealRestoreMasterKeyError]:
		"Не удалось восстановить мастер-ключ при перепаковке",
	[ErrorCodes.ErrCodeResealCompressFolderError]:
		"Не удалось сжать папку при перепаковке",
	[ErrorCodes.ErrCodeResealEncryptContainerError]:
		"Не удалось зашифровать контейнер при перепаковке",
	[ErrorCodes.ErrCodeResealWriteContainerError]:
		"Не удалось записать контейнер при перепаковке",
	[ErrorCodes.ErrCodeResealCreateIntegrityProviderError]:
		"Не удалось создать провайдер целостности при перепаковке",
	[ErrorCodes.ErrCodeResealDeriveAdditionalPasswordError]:
		"Не удалось вывести дополнительный пароль при перепаковке",

	[ErrorCodes.ErrCodeInfoWriterTypeInvalid]: "Неверный тип записи информации",
	[ErrorCodes.ErrCodeInfoWriterPathRequired]:
		"Не указан путь для записи информации",
	[ErrorCodes.ErrCodeInfoWriterFormatInvalid]:
		"Неверный формат записи информации",
	[ErrorCodes.ErrCodeInfoPathRequired]:
		"Не указан путь к контейнеру для получения информации",
};

// English error messages
const ErrorMessagesEn: Record<number, string> = {
	[ErrorCodes.ErrCodeContainerCurrentPathRequired]:
		"Current container path is required",
	[ErrorCodes.ErrCodeContainerNewPathRequired]:
		"New container path is required",
	[ErrorCodes.ErrCodeContainerFolderPathRequired]: "Folder path is required",
	[ErrorCodes.ErrCodeContainerPassphraseRequired]:
		"Container passphrase is required",
	[ErrorCodes.ErrCodeContainerOpenFileError]: "Failed to open container file",

	[ErrorCodes.ErrCodeCompressionTypeInvalid]: "Invalid compression type",

	[ErrorCodes.ErrCodeIntegrityProviderTypeInvalid]:
		"Invalid integrity provider type",
	[ErrorCodes.ErrCodeIntegrityProviderNewPassphraseRequired]:
		"New integrity passphrase is required",

	[ErrorCodes.ErrCodeShamirSharesEqualZero]:
		"Number of shares must be greater than zero",
	[ErrorCodes.ErrCodeShamirThresholdEqualZero]:
		"Threshold must be greater than zero",
	[ErrorCodes.ErrCodeShamirSharesLessThanThreshold]:
		"Number of shares must be greater than or equal to threshold",
	[ErrorCodes.ErrCodeShamirSharesLessThanTwo]:
		"Number of shares must be at least two",
	[ErrorCodes.ErrCodeShamirThresholdLessThanTwo]:
		"Threshold must be at least two",
	[ErrorCodes.ErrCodeShamirSharesGreaterThan255]:
		"Number of shares cannot exceed 255",
	[ErrorCodes.ErrCodeShamirThresholdGreaterThan255]:
		"Threshold cannot exceed 255",

	[ErrorCodes.ErrCodeTokenWriterTypeInvalid]: "Invalid token writer type",
	[ErrorCodes.ErrCodeTokenWriterPathRequired]:
		"Token writer path is required",
	[ErrorCodes.ErrCodeTokenWriterFormatInvalid]: "Invalid token writer format",
	[ErrorCodes.ErrCodeTokenReaderTypeInvalid]: "Invalid token reader type",
	[ErrorCodes.ErrCodeTokenReaderFlagRequired]:
		"Token reader flag is required",
	[ErrorCodes.ErrCodeTokenReaderPathRequired]:
		"Token reader path is required",
	[ErrorCodes.ErrCodeTokenReaderFormatInvalid]: "Invalid token reader format",
	[ErrorCodes.ErrCodeTokenTypeInvalid]: "Invalid token type",

	[ErrorCodes.ErrCodeUnsealOpenContainerError]: "Failed to open container",
	[ErrorCodes.ErrCodeUnsealGetTokenStringError]: "Failed to get token string",
	[ErrorCodes.ErrCodeUnsealParseTokensError]: "Failed to parse tokens",
	[ErrorCodes.ErrCodeUnsealRestoreMasterKeyError]:
		"Failed to restore master key",
	[ErrorCodes.ErrCodeUnsealContainerError]: "Container opening error",
	[ErrorCodes.ErrCodeUnsealUnpackContentError]: "Failed to unpack content",
	[ErrorCodes.ErrCodeUnsealGetReaderError]: "Failed to get reader",
	[ErrorCodes.ErrCodeUnsealReadAllError]: "Failed to read all data",
	[ErrorCodes.ErrCodeUnsealInvalidTokenFormatError]: "Invalid token format",
	[ErrorCodes.ErrCodeUnsealUnmarshalTokenListError]:
		"Failed to unmarshal token list",
	[ErrorCodes.ErrCodeUnsealParseTokenError]: "Failed to parse token",
	[ErrorCodes.ErrCodeUnsealDecodeMasterKeyError]:
		"Failed to decode master key",
	[ErrorCodes.ErrCodeUnsealDecodeShareValueError]:
		"Failed to decode share value",
	[ErrorCodes.ErrCodeUnsealDecodeShareSignatureError]:
		"Failed to decode share signature",
	[ErrorCodes.ErrCodeUnsealCompressionUnpackError]:
		"Failed to unpack compressed data",

	[ErrorCodes.ErrCodeSealCompressFolderError]: "Failed to compress folder",
	[ErrorCodes.ErrCodeSealCreateContainerError]: "Failed to create container",
	[ErrorCodes.ErrCodeSealCreateIntegrityProviderError]:
		"Failed to create integrity provider",
	[ErrorCodes.ErrCodeSealDeriveIntegrityProviderPassphraseError]:
		"Failed to derive integrity provider passphrase",
	[ErrorCodes.ErrCodeSealGenerateAndSaveTokensError]:
		"Failed to generate and save tokens",
	[ErrorCodes.ErrCodeSealCompressionPackError]:
		"Failed to pack compressed data",
	[ErrorCodes.ErrCodeSealCreateContainerHeaderError]:
		"Failed to create container header",
	[ErrorCodes.ErrCodeSealEncryptContainerError]:
		"Failed to encrypt container",
	[ErrorCodes.ErrCodeSealWriteContainerError]: "Failed to write container",
	[ErrorCodes.ErrCodeSealShamirSplitError]:
		"Failed to split key using Shamir scheme",
	[ErrorCodes.ErrCodeSealWriteTokensShareError]:
		"Failed to write share tokens",
	[ErrorCodes.ErrCodeSealBuildShareTokenError]: "Failed to build share token",
	[ErrorCodes.ErrCodeSealWriteTokenMasterError]:
		"Failed to write master token",
	[ErrorCodes.ErrCodeSealBuildMasterTokenError]:
		"Failed to build master token",

	[ErrorCodes.ErrCodeResealOpenContainerError]:
		"Failed to open container for reseal",
	[ErrorCodes.ErrCodeResealGetTokenStringError]:
		"Failed to get token string during reseal",
	[ErrorCodes.ErrCodeResealParseTokensError]:
		"Failed to parse tokens during reseal",
	[ErrorCodes.ErrCodeResealRestoreMasterKeyError]:
		"Failed to restore master key during reseal",
	[ErrorCodes.ErrCodeResealCompressFolderError]:
		"Failed to compress folder during reseal",
	[ErrorCodes.ErrCodeResealEncryptContainerError]:
		"Failed to encrypt container during reseal",
	[ErrorCodes.ErrCodeResealWriteContainerError]:
		"Failed to write container during reseal",
	[ErrorCodes.ErrCodeResealCreateIntegrityProviderError]:
		"Failed to create integrity provider during reseal",
	[ErrorCodes.ErrCodeResealDeriveAdditionalPasswordError]:
		"Failed to derive additional password during reseal",

	[ErrorCodes.ErrCodeInfoWriterTypeInvalid]: "Invalid info writer type",
	[ErrorCodes.ErrCodeInfoWriterPathRequired]: "Info writer path is required",
	[ErrorCodes.ErrCodeInfoWriterFormatInvalid]: "Invalid info writer format",
	[ErrorCodes.ErrCodeInfoPathRequired]: "Container path is required for info",
};

/**
 * Extracts human-readable error message from various error formats
 */
export function extractErrorMessage(error: unknown): string {
	// If error is already a string, return as is
	if (typeof error === "string") {
		return error;
	}

	// If error is null or undefined
	if (error == null) {
		return "Неизвестная ошибка";
	}

	// If error is an object with error field (TvaultErrorWithPath)
	if (typeof error === "object" && error !== null) {
		const errorObj = error as Record<string, unknown>;

		// Check TvaultErrorWithPath structure
		if (errorObj.error && typeof errorObj.error === "object") {
			const tvaultError = errorObj.error as TvaultError;
			if (tvaultError.message) {
				return tvaultError.message;
			}
		}

		// Check TvaultError structure directly
		if (errorObj.message && typeof errorObj.message === "string") {
			return errorObj.message;
		}

		// If there's a details field
		if (errorObj.details && typeof errorObj.details === "string") {
			return errorObj.details;
		}

		// If there's a suggestion field
		if (errorObj.suggestion && typeof errorObj.suggestion === "string") {
			return errorObj.suggestion;
		}

		// If there's an unwrapped field and it's an array of strings
		if (errorObj.unwrapped && Array.isArray(errorObj.unwrapped)) {
			const unwrapped = errorObj.unwrapped as string[];
			if (unwrapped.length > 0) {
				return unwrapped[0];
			}
		}
	}

	// If nothing matched, return JSON string
	try {
		return JSON.stringify(error);
	} catch {
		return "Неизвестная ошибка";
	}
}

/**
 * Gets localized error message based on error code
 */
export function getLocalizedErrorMessage(
	error: unknown,
	formatMessage: (descriptor: { id: string }) => string,
	locale?: string,
): string {
	const code = extractErrorCode(error);

	// If there's an error code, use the mapping
	if (code !== undefined) {
		const messages = locale === "en" ? ErrorMessagesEn : ErrorMessages;
		const message = messages[code];
		if (message) {
			return message;
		}
	}

	// If there's no code or message for the code, use general logic
	const message = extractErrorMessage(error).toLowerCase();

	// Determine error type by message
	if (isContainerNotFoundError(error)) {
		return formatMessage({ id: "common.error.containerNotFound" });
	}

	if (
		message.includes("access denied") ||
		message.includes("permission denied")
	) {
		return formatMessage({ id: "common.error.containerAccessDenied" });
	}

	if (message.includes("corrupted") || message.includes("damaged")) {
		return formatMessage({ id: "common.error.containerCorrupted" });
	}

	if (
		message.includes("invalid password") ||
		message.includes("wrong password")
	) {
		return formatMessage({ id: "common.error.invalidPassword" });
	}

	if (message.includes("invalid token") || message.includes("wrong token")) {
		return formatMessage({ id: "common.error.invalidToken" });
	}

	// If couldn't determine type, return original message
	return extractErrorMessage(error);
}

/**
 * Checks if the error is a "container not found" error
 */
export function isContainerNotFoundError(error: unknown): boolean {
	const message = extractErrorMessage(error).toLowerCase();
	const code = extractErrorCode(error);

	return (
		code === ErrorCodes.ErrCodeContainerOpenFileError ||
		code === ErrorCodes.ErrCodeUnsealOpenContainerError ||
		message.includes("no such file or directory") ||
		message.includes("open container error") ||
		message.includes("e-0043") ||
		message.includes("container not found") ||
		message.includes("файл не найден") ||
		message.includes("контейнер не найден")
	);
}

/**
 * Extracts error code from error structure
 */
export function extractErrorCode(error: unknown): number | undefined {
	if (typeof error === "object" && error !== null) {
		const errorObj = error as Record<string, unknown>;

		// Check TvaultErrorWithPath structure
		if (errorObj.error && typeof errorObj.error === "object") {
			const tvaultError = errorObj.error as TvaultError;
			if (typeof tvaultError.code === "number") {
				return tvaultError.code;
			}
		}

		// Check code directly
		if (typeof errorObj.code === "number") {
			return errorObj.code;
		}
	}

	return undefined;
}

/**
 * Checks if container should be removed from recent list for this error
 */
export function shouldRemoveContainerOnError(error: unknown): boolean {
	const code = extractErrorCode(error);
	const message = extractErrorMessage(error).toLowerCase();

	// Error codes for which container should be removed
	const removeCodes = [
		ErrorCodes.ErrCodeContainerOpenFileError,
		ErrorCodes.ErrCodeUnsealOpenContainerError,
		0x0043, // Legacy code
		67, // Legacy code
		100, // Legacy code
	];

	return (
		removeCodes.includes(code || 0) ||
		isContainerNotFoundError(error) ||
		message.includes("e-0043")
	);
}

/**
 * Extracts error type from error structure
 */
export function extractErrorType(error: unknown): number | undefined {
	if (typeof error === "object" && error !== null) {
		const errorObj = error as Record<string, unknown>;

		// Check TvaultErrorWithPath structure
		if (errorObj.error && typeof errorObj.error === "object") {
			const tvaultError = errorObj.error as TvaultError;
			if (typeof tvaultError.type === "number") {
				return tvaultError.type;
			}
		}

		// Check type directly
		if (typeof errorObj.type === "number") {
			return errorObj.type;
		}
	}

	return undefined;
}

/**
 * Extracts error category from error structure
 */
export function extractErrorCategory(error: unknown): number | undefined {
	if (typeof error === "object" && error !== null) {
		const errorObj = error as Record<string, unknown>;

		// Check TvaultErrorWithPath structure
		if (errorObj.error && typeof errorObj.error === "object") {
			const tvaultError = errorObj.error as TvaultError;
			if (typeof tvaultError.category === "number") {
				return tvaultError.category;
			}
		}

		// Check category directly
		if (typeof errorObj.category === "number") {
			return errorObj.category;
		}
	}

	return undefined;
}
