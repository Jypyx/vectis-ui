/**
 * Résout une valeur d'icône libre vers les props d'Icon : un nom Material
 * Symbols ne contient jamais '.', '/' ni ':' — toute valeur qui en contient
 * est une URL/chemin d'image (ou SVG) et passe par `src`.
 */
export const iconProps = (icon: string) => (/[./:]/.test(icon) ? { src: icon } : { name: icon })
