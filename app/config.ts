export type Proj = {
  proj_id: string;
  name: string;
  size: number;
  original_time: string;
  tag?: string;
  lock?: boolean;
  public: boolean;
  image_ids? : string[];
};