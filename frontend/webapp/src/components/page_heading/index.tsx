import { ActionIcon, Alert, Divider, Title } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React from "react";
import { Help, HelpOff, InfoCircle, QuestionMark } from "tabler-icons-react";
import "./style.scss";

/**
 * creates a simple heading for dashboard pages
 * withHelper: enables hinting/helper system
 * children: requires withHelper=true, React compontents as children for Alert component (e.g. helper text content)
 * storageId
 * @param props 
 * @returns 
 */
const PageHeading = (props) => {
  const { title, ...rest } = props;

  return <>
    <Title order={1} {...rest}>{title}</Title>
    <Divider mt="xs" mb="lg" />
  </>;
};

const PageHeadingWithHelper = (props) => {
  const { title, storageId, children, ...rest } = props;
  const [isHelperActive, setIsHelperActive] = useLocalStorage({ key: `h8m8-helper-widgets-${storageId ?? "default"}`, defaultValue: true });

  return <div className="wbs-page-heading">
    <PageHeading title={title} {...rest}/>
    {
      isHelperActive && 
          <Alert icon={<InfoCircle strokeWidth={1.5} size={26} />} title="Need help?" withCloseButton onClose={_ => {setIsHelperActive(false);}}>
            {children}
          </Alert>
    }
    <ActionIcon className="wbs-page-heading__helper" size="lg" radius="xl" variant="subtle" onClick={_ => {setIsHelperActive(old => !old);}}>
      {isHelperActive ? <HelpOff strokeWidth={1.5} size={26} /> : <Help strokeWidth={1.5} size={26} />}
    </ActionIcon>
  </div>;
};

export {PageHeading, PageHeadingWithHelper};
