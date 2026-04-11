// Products
export interface Product {
    id?: number;
    title?: string;
    description?: string;
    type?: string;
    brand?: string;
    collection?: any[];
    category?: string;
    price?: number;
    sale?: boolean;
    discount?: number;
    stock?: number;
    new?: boolean;
    quantity?: number;
    tags?: any[];
    images?: Images[];
    product_meta_tags?: string | string[];
}

export interface ProductNew {
    _id?: string;
    product_name?: string;
    product_slug?: string;
    product_description?: string;
    product_category?: ProCatagories[];
    product_store?: ProStores[];
    product_owner?: ProOwner[];
    product_image?: NewImages[];
    product_3d_image?: New3dImages[];
    product_retail_price?: number;
    product_sale_price?: number;
    addonsprice?: number;
    pack?: string;
    status?: string;
    stock?: number;
    left_eye_qty?:number;
    right_eye_qty?:number;
    createdAt?: Date;
    updatedAt?: Date;
    quantity?: number;
    cart_id?: string;
    tags?: any[];
    addons?: any[];
    product_meta_tags?: string | string[];
}
export interface ProductNew2 {
    _id?: string;
    product_name?: string;
    product_slug?: string;
    product_description?: string;
    product_category?: ProCatagories[];
    product_store?: ProStores[];
    product_image?: NewImages[];
    product_3d_image?: New3dImages[];
    product_retail_price?: number;
    product_sale_price?: number;
    left_eye_qty?:number;
    right_eye_qty?:number;
    status?: string;
    stock?: number;
    createdAt?: Date;
    updatedAt?: Date;
    quantity?: number;
    addons?: any[];
  product_meta_tags?: string | string[];
}
export interface ProCatagories {
    category_name?: string;
    category_slug?: string;
    status?: string;
    _id?: string;
}


export interface NewImages {
    pro_image?: string;
    status?: string;
}

export interface New3dImages {
    pro_3d_image?: string;
    status?: string;
}


export interface ProStores
{
    _id?: number;
    store_name?: string;  
    store_slug?: string;  
}
export interface ProOwner {
    _id?: string;
    name?: string;
}


export interface Images {
    image_id?: number;
    id?: number;
    alt?: string;
    src?: string;
    variant_id?: any[];
}