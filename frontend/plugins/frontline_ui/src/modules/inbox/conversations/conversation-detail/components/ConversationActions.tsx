import { Toggle } from 'erxes-ui';
import { useChangeConversationStatus } from '@/inbox/conversations/hooks/useChangeConversationStatus';
import { useConversationContext } from '@/inbox/conversations/hooks/useConversationContext';
import { ConversationStatus } from '@/inbox/types/Conversation';

export const ConversationActions = () => {
  return (
    <Toggle
      variant="outline"
      className="flex-none"
      pressed={status === ConversationStatus.CLOSED}
      onPressedChange={handleChangeConversationStatus}
      disabled={loading}
    >
      {status === ConversationStatus.CLOSED ? 'Open' : 'Resolve'}
    </Toggle>
  );
};
