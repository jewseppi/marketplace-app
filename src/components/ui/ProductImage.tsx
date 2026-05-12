"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

const PLACEHOLDER_SRC = "/images/product-placeholder.svg";

export function ProductImage(props: ImageProps) {
  const { alt, src: source, ...rest } = props;
  const [failed, setFailed] = useState(false);
  const src = useMemo(() => {
    if (failed || !source) {
      return PLACEHOLDER_SRC;
    }
    return source;
  }, [failed, source]);

  return <Image {...rest} alt={alt} src={src} onError={() => setFailed(true)} />;
}
