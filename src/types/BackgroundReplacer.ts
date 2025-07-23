export type BackgroundReplacerEventData = {
  _id: string;
  user: string;
  name: string;
  logo: string;
  background: string;
  templates: Template[];
  backgroundImages: BackgroundImage[];
  createdAt: string; 
  updatedAt: string; 
  data: GeneratedImage[];
};

type Template = {
  _id: string;
  templateUrl: string;
};

type BackgroundImage = {
  _id: string;
  backgroundImageUrl: string;
  centerUser: boolean;
  coordinates: Coordinates;
};

type Coordinates = {
  top_left_x: string;
  top_left_y: string;
  bottom_left_x: string;
  bottom_left_y: string;
};

type GeneratedImage = {
  _id: string;
  userImage: string;
  finalImage: string
  taskId: string;
};