import { IsBoolean, IsInt, IsString, MaxLength, max } from "class-validator";

export class GeneralSettingDto {
  @IsInt()
  @MaxLength(2)
  fontSize = 14;

  @IsString()
  fontFamily =
    '"Helvetica Neue","Luxi Sans","DejaVu Sans","Hiragino Sans GB","Microsoft Yahei",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Segoe UI Symbol","Android Emoji","EmojiSymbols"';
  @IsBoolean()
  autocorrect = false;
}
