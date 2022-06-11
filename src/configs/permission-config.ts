import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  InferSubjects,
  ExtractSubjectType,
} from '@casl/ability';
import Brand from '../models/Brand';
import Photo from '../models/Photo';
import Product from '../models/Product';
import User from '../models/User';

/*eslint-disable */
export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  ReadOne = 'read_one',
}

export type Subjects =
  | InferSubjects<
      | typeof User
      | typeof Product
      | typeof Photo
      | typeof Brand
    >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export const PermissionBuilder = (user: User) => {
  const { can, build } = new AbilityBuilder<AppAbility>(
    Ability as AbilityClass<AppAbility>,
  );

  can(
    [Action.Update, Action.ReadOne], 
    User, 
    ['firstName', 'lastName', 'email', 'phoneNumber', 'password'], 
    { id: user.id, status: User.STATUS_ACTIVATED }
  );

  can([Action.Read, Action.ReadOne], Product);

  if (user.admin) {
    can([Action.Read, Action.ReadOne], User, { status: User.STATUS_ACTIVATED });
    can(Action.Update, User, ['status'], { id: { $ne: user.id }, status: User.STATUS_ACTIVATED });

    can(Action.Manage, [Photo, Brand]);
    can(Action.Update, Product);
  }

  if (user.admin && user.adminRole === User.ADMIN_ROLE_SUPER) {
    can(Action.Update, User, ['admin'], { id: { $ne: user.id } });
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<Subjects>,
  });
};
