import bmsResolvers from '~/modules/bms/graphql/resolvers/customResolvers';
import pmsResolvers from '~/modules/pms/graphql/resolvers/customResolvers';

export default {
  ...bmsResolvers,
  ...pmsResolvers,
};
