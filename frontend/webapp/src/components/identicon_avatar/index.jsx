import { Avatar } from "@mantine/core";
import React, { useMemo } from "react";
import Identicon from "identicon.js";
import "./style.scss";
import { hex_sha256 } from "../../utils/sha256";

const IdenticonAvatar = (props) => {
  const { id, ...other } = props;

  const identiconImage = useMemo(() => {
    if (id === undefined || id === null) return null;
    try {
      const hash = hex_sha256(`${id}`);
      const data = new Identicon(hash, 128).toString();
      return `data:image/png;base64,${data}`;
    } catch (error) {
      return null;
    }
  }, [id]);

  return <Avatar src={identiconImage} {...other} />;
};

export default React.memo(IdenticonAvatar);
