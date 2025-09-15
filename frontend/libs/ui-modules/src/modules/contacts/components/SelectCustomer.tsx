import { SelectCustomerContext } from '../contexts/SelectCustomerContext';
import { ICustomer } from '../types';
import { useSelectCustomerContext } from '../hooks/useSelectCustomerContext';
import { useCustomers } from '../hooks';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import {
  cn,
  Combobox,
  Command,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { CustomersInline } from './CustomersInline';

interface SelectCustomerProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const SelectCustomer = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  ButtonProps & SelectCustomerProps
>(({ value, onValueChange, children, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ICustomerInline | undefined>(
    undefined,
  );

  const handleSelect = (user: ICustomerInline | undefined) => {
    setSelectedUser(user);
    onValueChange?.(user?._id || '');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      {children ? (
        children
      ) : (
        <SelectCustomerTrigger
          value={value || ''}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          {...props}
          ref={ref}
        />
      )}

      <Combobox.Content>
        <SelectCustomerList
          renderItem={(customer) => (
            <SelectCustomerItem
              key={customer._id}
              customer={customer}
              selectedUser={selectedUser}
              handleSelect={handleSelect}
            />
          )}
        />
      </Combobox.Content>
    </Popover>
  );
});

export function SelectCustomerList({
  renderItem,
}: {
  renderItem: (customer: ICustomerInline) => React.ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { customers, loading, handleFetchMore, totalCount, error } =
    useCustomers({
      variables: {
        searchValue: debouncedSearch,
      },
    });
  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />
        {customers?.map((customer: ICustomerInline) => renderItem(customer))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={customers?.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
}

export const SelectCustomerTrigger = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  ButtonProps & {
    value: string;
    selectedUser?: ICustomerInline;
    setSelectedUser: (customer?: ICustomerInline) => void;
  }
>(({ value, selectedUser, setSelectedUser, ...props }, ref) => {
  const { loading } = useCustomerInline({
    variables: { _id: value },
    skip: !value || selectedUser?._id === value,
    onCompleted: ({ customerDetail }: { customerDetail: ICustomerInline }) => {
      setSelectedUser({ ...customerDetail, _id: value });
    },
  });

  return (
    <Combobox.Trigger disabled={loading} {...props} ref={ref}>
      {value ? (
        <CustomerInline
          customer={selectedUser}
          avatarProps={{
            size: props.size as AvatarProps['size'],
          }}
        />
      ) : loading ? (
        <Skeleton className="w-full h-8" />
      ) : (
        <Combobox.Value placeholder="Select customer" />
      )}
    </Combobox.Trigger>
  );
});

export const SelectCustomerItem = ({
  customer,
  selectedUser,
  handleSelect,
}: {
  customer: ICustomerInline;
  selectedUser?: ICustomerInline;
  handleSelect: (customer?: ICustomerInline) => void;
}) => {
  const isSelected = selectedUser?._id === customer._id;
  return (
    <Command.Item
      key={customer._id}
      value={customer._id}
      onSelect={() => handleSelect(isSelected ? undefined : customer)}
    >
      <CustomerInline customer={customer} />
      <Combobox.Check checked={isSelected} />
    </Command.Item>
  );
};

const SelectCustomerInlineCell = ({
  onValueChange,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <RecordTableInlineCell.Trigger>
          <SelectCustomer.Value />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectCustomer.Content />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectCustomerProvider>
  );
};

const SelectCustomerRoot = ({
  onValueChange,
  className,
  mode = 'single',
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        if (mode === 'single') {
          setOpen(false);
        }
        onValueChange?.(value);
      }}
      mode={mode}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          className={cn('w-full inline-flex', className)}
          variant="outline"
        >
          <SelectCustomer.Value />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectCustomer.Content />
        </Combobox.Content>
      </Popover>
    </SelectCustomerProvider>
  );
};
const SelectCustomerValue = () => {
  const { customerIds, customers, setCustomers } = useSelectCustomerContext();

  return (
    <CustomersInline
      customerIds={customerIds}
      customers={customers}
      updateCustomers={setCustomers}
    />
  );
};

const SelectCustomerFormItem = ({
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectCustomerProvider>, 'children'> & {
  className?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectCustomerProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectCustomer.Value />
          </Combobox.Trigger>
        </Form.Control>

        <Combobox.Content>
          <SelectCustomer.Content />
        </Combobox.Content>
      </Popover>
    </SelectCustomerProvider>
  );
};

export const SelectCustomer = Object.assign(SelectCustomerRoot, {
  Provider: SelectCustomerProvider,
  Content: SelectCustomerContent,
  Item: SelectCustomerCommandItem,
  InlineCell: SelectCustomerInlineCell,
  Value: SelectCustomerValue,
  FormItem: SelectCustomerFormItem,
});
