export type Pet = {
  name: string;
  img_path: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  vaccines?: Vaccine[];
};

export type PetPostDetails = {
  id: string;
  name: string;
  img_path: string;
};

export type Vaccine = {
  name: string;
  date: string;
};
