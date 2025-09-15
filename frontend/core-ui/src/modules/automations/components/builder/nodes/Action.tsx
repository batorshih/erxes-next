import { NodeOutputHandler } from '@/automations/components/builder/nodes/NodeOutputHandler';
import { IconAdjustmentsAlt } from '@tabler/icons-react';
import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import { cn, IconComponent } from 'erxes-ui';
import { memo } from 'react';
// import {
//     type NodeProps,
//     Handle,
//     Position
// } from "reactflow"
import { cn } from 'erxes-ui';
import { IconAdjustmentsAlt, IconMessage, IconPlus } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { NodeData } from '../../../types';
import { ErrorState } from '../../../utils/ErrorState';
import { NodeDropdownActions } from './NodeActions';
import { ActionNodeContent } from './ActionContent';
import { TAutomationProps } from '@/automations/utils/AutomationFormDefinitions';

const renderContent = (data: NodeData) => {
  if (data?.error) {
    return (
      <ErrorState errorCode={'Invalid action'} errorDetails={data?.error} />
    );
  }

  if (data.type === 'if') {
    return null;
  }

  if (!Object.keys(data?.config || {}).length) {
    return null;
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 text-success/90 pb-2">
        <IconAdjustmentsAlt className="size-4" />
        <p className="text-sm font-semibold">Configuration</p>
      </div>
      <div className="rounded border bg-muted overflow-x-auto">
        <ActionNodeContent type={data.type || ''} config={data.config} />
      </div>
    </div>
  );
};

const renderSourceHandler = (type: string) => {
  const position = Position.Right;
  if (type === 'if') {
    return (
      <>
        <Handle
          key="yes-right"
          id="yes-right"
          type="source"
          position={position}
          className={`!w-4 !h-4 -z-10 !bg-success`}
          style={{ top: '50%' }}
        >
          <div className="ml-4 text-xs text-muted-foreground fixed -top-2">
            True
          </div>
        </NodeOutputHandler>
        <NodeOutputHandler
          key="no-right"
          id="no-right"
          type="source"
          position={position}
          className={`!w-4 !h-4 -z-10 !bg-red-300`}
          style={{ top: '70%' }}
        >
          <div className="ml-4 text-xs text-muted-foreground ">False</div>
        </Handle>
      </>
    );
  }
  return (
    <>
      <Handle
        key="right"
        id="right"
        type="source"
        position={position}
        className={`!w-4 !h-4 -z-10 !bg-success `}
      />
    </>
  );
};

const ActionNode = ({ data, selected, id }: NodeProps<Node<NodeData>>) => {
  const { beforeTitleContent, config, nextActionId } = data;

  return (
    <div className="flex flex-col" key={id}>
      <div className="w-1/4 ml-1 bg-success/10 text-success text-center px-2 py-1 rounded-t-md">
        <p className="font-medium font-bold">Action</p>
      </div>
      <div
        className={cn(
          'rounded-md shadow-md bg-white border border-muted w-[280px] font-mono',
          selected ? 'ring-2 ring-success ring-offset-2' : '',
          data?.error ? 'ring-2 ring-red-300 ring-offset-2' : '',
          'transition-all duration-200',
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-muted">
          <div className="flex items-center gap-2 text-success/90">
            <div
              className={`size-6 rounded-full bg-success/10  flex items-center justify-center`}
            >
              <IconComponent className="size-4" name={data.icon} />
            </div>
            <span className="font-medium">{data.label}</span>
          </div>

          <div className="flex items-center gap-1">
            <NodeDropdownActions id={id} data={data} setValue={setValue} />
          </div>
        </div>

        <div className="p-3 border-b border-muted ">
          <span className="text-xs text-accent-foreground font-medium">
            {data.description}
          </span>
        </div>
        {renderContent(data)}

        {/* Input handle */}
        <Handle
          key="left"
          id="left"
          type="target"
          position={Position.Left}
          className={`!w-4 !h-4 -z-10 !bg-success `}
        />

        {renderSourceHandler(data.type)}
      </div>
    </div>
  );
};

export default memo(ActionNode);
