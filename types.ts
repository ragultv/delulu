
export interface Dialogue {
  character: string;
  text: string;
}

export interface ComicPanelData {
  panel: number;
  scene: string;
  style: string;
  dialogues: Dialogue[];
  image_generation_prompt: string;
}
