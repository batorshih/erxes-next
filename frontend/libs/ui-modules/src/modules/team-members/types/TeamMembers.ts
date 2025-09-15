import { SlashMenuProps } from 'erxes-ui';

export interface IMember {
  _id: string;
  email?: string;
  username?: string;
  details?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatar?: string;
  };
}
export interface IMemberGroup {
  _id: string;
  name: string;
  description: string;
  members?: IUser[];
  memberIds?: string[];
}

export interface IUserGroupContext {
  groupsIds: string[];
  onSelect: (group: IUserGroup) => void;
  usersGroups: IUserGroup[];
  setUsersGroups: (usersGroups: IUserGroup[]) => void;
  loading: boolean;
  error: string | null;
}

export interface MentionMenuProps extends SlashMenuProps {
  loading: boolean;
  users: IMember[];
  handleFetchMore: () => void;
  totalCount: number;
}
