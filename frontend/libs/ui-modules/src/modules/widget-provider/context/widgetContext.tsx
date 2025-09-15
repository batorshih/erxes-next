import { createContext, useContext } from 'react';

export type RelationWidgetProps = {
  module: string;
  pluginName: string;
  contentId: string;
  contentType: string;
};

export const RelationWidgetContext = createContext<{
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: { name: string; pluginName: string }[];
}>(
  {} as {
    RelationWidget: (props: any) => JSX.Element | null;
    relationWidgetsModules: { name: string; pluginName: string }[];
  },
);

export const WidgetProvider = ({
  children,
  Widget,
  widgetsModules,
}: {
  children: React.ReactNode;
  RelationWidget: (props: RelationWidgetProps) => JSX.Element | null;
  relationWidgetsModules: { name: string; pluginName: string }[];
}) => {
  return (
    <WidgetContext.Provider value={{ Widget, widgetsModules }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = () => {
  return useContext(WidgetContext);
};
