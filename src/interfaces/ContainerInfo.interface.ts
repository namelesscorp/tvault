export interface ContainerInfoData {
	name?: string;
	version?: number;
	created_at?: string;
	updated_at?: string;
	comment?: string;
	tags?: string[];
	token_type?: string;
	integrity_provider_type?: string;
	compression_type?: string;
	shares?: number;
	threshold?: number;
	/** Added in tvault-core v1.0.1 — absent on containers made by older cores. */
	file_count?: number;
	compressed_size?: number;
	uncompressed_size?: number;
	/** 0.0 – 1.0, computed by the core (see tvault-core/security). */
	security_score?: number;
}

export interface ContainerInfoPayload {
	path?: string;
	data?: ContainerInfoData;
}
