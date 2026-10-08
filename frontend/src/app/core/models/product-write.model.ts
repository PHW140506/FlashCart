/** Campos editables; ID, valoraciones y rol nunca se toman del formulario. */
export interface ProductWriteInput {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}
