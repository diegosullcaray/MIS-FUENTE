export interface IShortcut{
  name: string;
  state?: string;
  icon?: string;
  type?: number;
  info?:string;
}

export interface IBadge {
  color: string; // primary/accent/warn/hex color codes(#fff000)
  value: string; // Display text
}
