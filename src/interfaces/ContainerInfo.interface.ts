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
}

export interface ContainerInfoPayload {
	path?: string;
	data?: ContainerInfoData;
}
