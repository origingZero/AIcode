export interface CardData {
  id: string;
  title: string;
  summary: string;
  link: string;
  published: string;
  image_prompt: string;
  image_palette: string;
  image_seed: number;
  image_url: string;
}

export type Locale = 'zh' | 'en';

export interface ToastState {
  message: string;
  type: 'info' | 'success';
  visible: boolean;
}
