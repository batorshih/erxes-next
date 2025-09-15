import { PageHeader } from 'ui-modules';
import { CustomerAddSheet } from './CustomerAddSheet';
import { useLocation } from 'react-router-dom';
import { ContactsBreadcrumb } from '@/contacts/components/ContactsBreadcrumb';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';

export const CustomersHeader = () => {
  const { isLead } = useIsCustomerLeadSessionKey();

  return (
    <PageHeader>
      <PageHeader.Start>
        <ContactsBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>

      <PageHeader.End>
        <CustomerAddSheet />
      </PageHeader.End>
    </PageHeader>
  );
};
