export type ProductStatus = "validating" | "building" | "launched";

export interface ProductFormValues {
	icp: string;
	link: string;
	name: string;
	painPoint: string;
	solution: string;
}

export interface ProfileProduct {
	_key?: string;
	createdAt: Date;
	founderId: string;
	icp: string | null;
	id: string;
	imageUrl: string | null;
	link: string | null;
	name: string;
	painPoint: string | null;
	solution: string | null;
	status: ProductStatus;
	updatedAt: Date;
}
