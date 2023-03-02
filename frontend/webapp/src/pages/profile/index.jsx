import { Badge, Divider, Group, Stack, Text } from "@mantine/core";
import moment from "moment";
import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import IdenticonAvatar from "../../components/identicon_avatar";
import { PageHeading } from "../../components/page_heading";
import {
  selectGroups,
  selectUsername,
} from "../../redux/ducks/auth-duck/auth.duck.selectors";
import CONSTANTS from "../../utils/constants";
import "./style.scss";

const ProfilePage = () => {
  const username = useSelector(selectUsername);
  const groups = useSelector(selectGroups);

  const profileAttributes = useMemo(() => {
    return [
      {
        label: "Username",
        value: username,
      },
      {
        label: "Assigned Roles",
        value: groups,
        isValueList: true,
      },
      {
        label: "Active Since",
        value: moment().format(CONSTANTS.DEFAULT_TIMESTAMP),
      },
      {
        label: "Test Field",
        value: null,
      },
    ];
  }, [groups, username]);

  const createProfileAttributeItem = useCallback(
    (e, key) => {
      let value = null;
      if (e?.value){
        if (e?.isValueList){
          value = <Group>
            {e.value.map((ev, i) => (
              <Badge key={i}>{ev}</Badge>
            ))}
          </Group>;
        } else {
          value = e.value;
        }
      }

      return <div className="wbs-profile-container__att-item" key={key}>
        <Text weight={600} size="lg">
          {e?.label}
        </Text>
        <Text size="xl">{value ?? " -- "}</Text>
      </div>;
    },
    []
  );

  return (
    <div className="wbs-profile-page wsb-page-content">
      <PageHeading title="Profile" />
      <div className="wbs-profile-container">
        <IdenticonAvatar id={username} size="xl" radius="sm" />
        <Divider
          className="wbs-profile-container__divider"
          orientation="vertical"
        />
        <Stack>
          {profileAttributes &&
            profileAttributes.map((e, i) => {
              return createProfileAttributeItem(e, i);
            })}
        </Stack>
      </div>
    </div>
  );
};

export default ProfilePage;
