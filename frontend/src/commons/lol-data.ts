import { david } from '@/assets';

export const LOL_VERSION = '15.12.1';

export const playersData = [
  {
    title: 'Vagabundo', // Felipe
    skin: 'Viktor_3',
    puuid:
      '7nDVkHJU_EUzwXv-Gx00Omv2Od0kf_cayZQbGHrDAWcUEo2aAgii3Oa9B3IxslsVkxjQr_iZ_PAn2Q',
  },
  {
    title: 'Vagabundo', // Ghigho
    skin: 'Thresh_1',
    puuid:
      '-KTo82lkyRfxSAuggZnXY3yvBjN6qL-RHWUUu-CiaJL0y9mTocPeGoVmbgkEPSLXuwyyxcD9URKetA',
  },
  {
    title: 'Horrível', // David
    skin: david.src,
    puuid:
      'llUIMNEhv_T2z6kCdd6JVyeKEgumv-0-3jC_M0NhoEGxWiSxuH2RoFL_jlZo6PCxJ6qTDONqYxa80A',
  }, // Zed_1
  {
    title: 'Gold mais forte', // Neto
    skin: 'Xayah_37',
    puuid:
      'OSY7lpbDqEGueNxZw2NjOXv0xCCpDZZ-Oub6jfE8JcsxJHR-hkZTHyMuCbfSKG-w2f1sEEsNiLI1nw',
  },
  {
    title: 'Aposentado', // Bruno
    skin: 'Darius_3',
    puuid:
      'AWlqS2UDDZg94vG8ZDfE4MhFMqHMF-i_rsNRvuwDLjrh0nHE01TfHBeBbbqzee2Tgptn2fU9rcQAOw',
  },
  {
    title: 'Soul silver', // Henrickler
    skin: 'Lillia_19',
    puuid:
      'pfONoHAWCuWgRN5CEj0KbL14j4Ppc9GHXSgaCJzgbGHBE1eXGAnrt1ZVvPL3dY3J_1DJNPKvpJXT6g',
  },
  {
    title: 'Superestimado', // Paulo
    skin: 'Gwen_11',
    puuid:
      'J0T0BYQXqHAEXUi8_dLhQiLwSsi5V_4o0X2GsSM-veIqV-o_9nCp9LLt2DwX-mVIQFqquGrT0EWq_w',
  },
  {
    title: 'Narigudo', // Ianguas
    skin: 'Varus_60',
    puuid:
      'RH-na3OpXeDwMoiIt8o6Di1ygIO2QF3AG4QTFf01NyEIi6EQybDtRNYH2AGSzmRHoMoofwyAZszfaQ',
  },
  {
    title: 'Ex diamante 1', // Thiago
    skin: 'Riven_16',
    puuid:
      'awiuMM0WCsb3Ae7h10P7nTKYjpt_daiD4vZp_o9Rzx0cSaeoneXsHH2_e2NpHCXdS2yPqSZTXcP8sw',
  },
  {
    title: 'Pereba', // Verona
    skin: 'Kaisa_40',
    puuid:
      'U5UbYRf4GexyV5TZsA3eijiBl3rUGbJIBsqGu8mZa7M9CRKANu4A80YWBxB9FBrkUcIEHBmk72uzsg',
  },
];

export const tiers: { en: Tier; pt: string }[] = [
  { en: 'SILVER', pt: 'PRATA' },
  { en: 'GOLD', pt: 'OURO' },
  { en: 'PLATINUM', pt: 'PLATINA' },
  { en: 'EMERALD', pt: 'ESMERALDA' },
  { en: 'DIAMOND', pt: 'DIAMANTE' },
  { en: 'MASTER', pt: 'MESTRE' },
];

export const ranks: Rank[] = ['IV', 'III', 'II', 'I'];

export const spells = {
  1: 'Boost',
  3: 'Exhaust',
  4: 'Flash',
  6: 'Haste',
  7: 'Heal',
  11: 'Smite',
  12: 'Teleport',
  14: 'Dot',
  21: 'Barrier',
  32: 'Snowball',
} as Record<number, string>;
