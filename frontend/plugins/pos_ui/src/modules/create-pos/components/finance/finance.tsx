import { Input, Label, Select, Switch, Form } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { financeConfigSettingsAtom } from '../../states/posCategory';
import { useEffect, useState } from 'react';
import { IPosDetail } from '@/pos-detail.tsx/types/IPos';
import { options } from '@/constants';

interface FinanceConfigFormProps {
  form: UseFormReturn<FinanceConfigFormValues>;
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: any) => Promise<void>;
}

export default function FinanceConfigForm({
  posDetail,
  isReadOnly = false,
  onSubmit,
}: FinanceConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [financeConfig, setFinanceConfig] = useAtom(financeConfigSettingsAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (posDetail) {
      setFinanceConfig({
        isSyncErkhet: posDetail.erkhetConfig?.isSyncErkhet ?? false,
        checkErkhet: posDetail.erkhetConfig?.checkErkhet ?? false,
        checkInventories: posDetail.isCheckRemainder ?? false,
        userEmail: posDetail.erkhetConfig?.userEmail || '',
        beginBillNumber:
          posDetail.beginNumber || posDetail.erkhetConfig?.beginNumber || '',
        defaultPay: posDetail.erkhetConfig?.defaultPay || '',
        account: posDetail.erkhetConfig?.account || '',
        location: posDetail.erkhetConfig?.location || '',
        getRemainder: posDetail.erkhetConfig?.getRemainder ?? false,
      };

      reset(financeData);
    }
  }, [posDetail, setFinanceConfig]);

  const handleSwitchChange = (
    field: keyof typeof financeConfig,
    value: boolean,
  ) => {
    if (isReadOnly) return;
    setFinanceConfig({
      ...financeConfig,
      [field]: value,
    });
  };

  const handleInputChange = (
    field: keyof typeof financeConfig,
    value: string,
  ) => {
    if (isReadOnly) return;
    setFinanceConfig({
      ...financeConfig,
      [field]: value,
    });
  };

  const handleSelectChange = (
    field: keyof typeof financeConfig,
    value: string,
  ) => {
    if (isReadOnly) return;
    setFinanceConfig({
      ...financeConfig,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(financeConfig);
      } catch (error) {
        console.error('Finance config form submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Finance config form submitted:', financeConfig);
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', 'delivery');
      setSearchParams(newParams);
    }
  };

  const getFormTitle = () => {
    if (isReadOnly) return 'View Finance Configuration';
    return posDetail
      ? 'Edit Finance Configuration'
      : 'Configure Finance Settings';
  };

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {getFormTitle()}
        </h2>
      </div>

              <Form.Field
                control={control}
                name="isSyncErkhet"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        IS SYNC ERKHET
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

          <div className="flex flex-col gap-3">
            <span className="text-gray-600">IS SYNC ERKHET</span>
            <Switch
              className="scale-150 w-7"
              checked={financeConfig.isSyncErkhet}
              onCheckedChange={(checked) =>
                handleSwitchChange('isSyncErkhet', checked)
              }
              disabled={isReadOnly}
            />
          </div>
        </div>

              <Form.Field
                control={control}
                name="checkErkhet"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        CHECK ERKHET
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name="checkInventories"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        CHECK INVENTORIES
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            {isSyncErkhet && (
              <div className="space-y-6">
                <h2 className="text-indigo-600 text-xl font-medium">OTHER</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Form.Field
                    control={control}
                    name="userEmail"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            USER EMAIL
                          </Form.Label>
                          <Form.Control>
                            <Input
                              type="email"
                              {...field}
                              placeholder="Enter email"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="beginBillNumber"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            BEGIN BILL NUMBER
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter bill number"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="defaultPay"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            DEFAULTPAY
                          </Form.Label>
                          <Form.Control>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Select..." />
                              </Select.Trigger>
                              <Select.Content>
                                {options.map((option) => (
                                  <Select.Item
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Field
                    control={control}
                    name="account"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            ACCOUNT
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter account"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="location"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            LOCATION
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter location"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
