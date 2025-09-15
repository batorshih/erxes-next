import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CUSTOMERS } from '@/contacts/customers/graphql/queries/getCustomers';
import { ICustomer } from 'ui-modules';
import {
  useRecordTableCursor,
  mergeCursorData,
  validateFetchMore,
  EnumCursorDirection,
  useNonNullMultiQueryState,
  parseDateRangeFromString,
  ICursorListResponse,
  useMultiQueryState,
  isUndefinedOrNull,
} from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { ContactsPath } from '@/types/paths/ContactsPath';
import { CUSTOMERS_CURSOR_SESSION_KEY } from '@/contacts/customers/constants/customersCursorSessionKey';

const CUSTOMERS_PER_PAGE = 30;

export const useCustomersVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ICustomer>>['variables'],
) => {
  const { isLead } = useIsCustomerLeadSessionKey();
  const [{ searchValue, tags, created, updated, lastSeen, brand, birthday }] =
    useMultiQueryState<{
      searchValue: string;
      tags: string[];
      created: string;
      updated: string;
      lastSeen: string;
      brand: string;
      birthday: string;
    }>([
      'searchValue',
      'tags',
      'created',
      'updated',
      'lastSeen',
      'brand',
      'birthday',
    ]);
  const { sessionKey } = useIsCustomerLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey: CUSTOMERS_CURSOR_SESSION_KEY,
  });

  return {
    limit: CUSTOMERS_PER_PAGE,
    cursor,
    searchValue: searchValue || undefined,
    tagIds: tags || undefined,
    brandIds: brand ? [brand] : undefined,
    dateFilters: JSON.stringify({
      createdAt: {
        gte: parseDateRangeFromString(created)?.from,
        lte: parseDateRangeFromString(created)?.to,
      },
      updatedAt: {
        gte: parseDateRangeFromString(updated)?.from,
        lte: parseDateRangeFromString(updated)?.to,
      },
      lastSeenAt: {
        gte: parseDateRangeFromString(lastSeen)?.from,
        lte: parseDateRangeFromString(lastSeen)?.to,
      },
      birthDate: {
        gte: parseDateRangeFromString(birthday)?.from,
        lte: parseDateRangeFromString(birthday)?.to,
      },
    }),
    type: isLead ? 'lead' : 'customer',
    ...variables,
  };
};

export const useCustomers = (
  options?: QueryHookOptions<ICursorListResponse<ICustomer>>,
) => {
  const setCustomerTotalCount = useSetAtom(customerTotalCountAtom);
  // Customer Filter implementation

  const variables = useCustomersVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<ICursorListResponse<ICustomer>>(
    GET_CUSTOMERS,
    {
      ...options,
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      variables,
    },
  );

  const { list: customers, pageInfo, totalCount } = data?.customers || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CUSTOMERS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          customers: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.customers,
            prevResult: prev.customers,
          }),
        });
      },
    });
  };

  return {
    loading,
    customers,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};
