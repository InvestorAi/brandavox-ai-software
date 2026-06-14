// Brandavox API Route - Chat Messaging & AI Mentions
// Location: src/app/api/messages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runAgent } from '@/lib/ai/agentRouter';
import { getAIProvider } from '@/lib/ai/provider';
import { readMockDb, writeMockDb, MockMessage } from '@/lib/utils/mockDb';

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && url.trim() !== '' && !url.includes('your-project');
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');
    const recipientId = searchParams.get('recipientId');

    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      let msgs = [...db.messages];

      if (recipientId) {
        // Direct messages between 'user-godswill' (mock user) and recipientId
        const userId = 'user-godswill';
        msgs = msgs.filter(
          (m) =>
            (m.sender_id === userId && m.recipient_id === recipientId) ||
            (m.sender_id === recipientId && m.recipient_id === userId)
        );
      } else if (channelId) {
        // Channel messages (where recipient_id is null)
        msgs = msgs.filter((m) => m.channel_id === channelId && !m.recipient_id);
      }

      msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return NextResponse.json({
        success: true,
        data: msgs,
        error: null,
      });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, data: null, error: 'User organization not found' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('messages')
      .select('*')
      .eq('organization_id', userData.organization_id);

    if (recipientId) {
      // DMs filter: (sender=me AND recipient=them) OR (sender=them AND recipient=me)
      query = query.or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`
      );
    } else if (channelId) {
      query = query.eq('channel_id', channelId).is('recipient_id', null);
    }

    const { data: msgs, error: msgsError } = await query.order('created_at', { ascending: true });

    if (msgsError) {
      throw msgsError;
    }

    // Resolve sender names/roles for Supabase dynamically
    const senderIds = Array.from(new Set((msgs || []).map((m) => m.sender_id).filter(Boolean)));
    let usersMap: Record<string, { full_name: string; role: string }> = {};

    if (senderIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, full_name, role')
        .in('id', senderIds);
      
      (usersData || []).forEach((u) => {
        usersMap[u.id] = { full_name: u.full_name, role: u.role };
      });
    }

    const mappedMsgs = (msgs || []).map((m) => ({
      ...m,
      sender_name: usersMap[m.sender_id]?.full_name || (m.sender_id.startsWith('agent-') ? m.sender_id === 'agent-copy' ? 'AI Copywriter' : 'AI Brand Strategist' : 'Unknown Member'),
      sender_role: usersMap[m.sender_id]?.role || (m.sender_id.startsWith('agent-') ? 'AI Assistant' : 'member'),
    }));

    return NextResponse.json({
      success: true,
      data: mappedMsgs,
      error: null,
    });
  } catch (err: any) {
    console.error('Error fetching messages:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, recipientId, content, fileAttachments } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, data: null, error: 'Message content cannot be empty' },
        { status: 400 }
      );
    }

    let senderId = 'user-godswill';
    let senderName = 'Godswill Johnson';
    let senderRole = 'owner';
    let organizationId = 'mock-org-123';
    let userEmail = '';

    // 1. Fetch user context
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, data: null, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('organization_id, full_name, role, email')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { success: false, data: null, error: 'User context not found' },
          { status: 400 }
        );
      }

      senderId = user.id;
      senderName = userData.full_name;
      senderRole = userData.role;
      organizationId = userData.organization_id;
      userEmail = userData.email;
    }

    const dbMessage: any = {
      organization_id: organizationId,
      sender_id: senderId,
      content,
      recipient_id: recipientId || null,
      channel_id: channelId || 'general',
      file_attachments: fileAttachments || [],
    };

    let savedMessage: any;

    // 2. Save User Message
    if (!isSupabaseConfigured()) {
      const db = readMockDb();
      savedMessage = {
        id: `msg-${Math.random().toString(36).substr(2, 9)}`,
        ...dbMessage,
        sender_name: senderName,
        sender_role: senderRole,
        created_at: new Date().toISOString(),
      };
      db.messages.push(savedMessage);
      writeMockDb(db);
    } else {
      const supabase = await createClient();
      const { data: msg, error: insertError } = await supabase
        .from('messages')
        .insert(dbMessage)
        .select('*')
        .single();

      if (insertError) throw insertError;
      savedMessage = {
        ...msg,
        sender_name: senderName,
        sender_role: senderRole,
      };
    }

    // 3. Process AI Agent Mentions asynchronously/inline
    const trimContent = content.trim();
    let agentResponse: string | null = null;
    let agentId = '';
    let agentName = '';

    if (trimContent.startsWith('@copy') || trimContent.startsWith('@brand')) {
      // Fetch Brand Profile for context
      let brand: any = null;
      if (!isSupabaseConfigured()) {
        const db = readMockDb();
        brand = db.brands[0]; // default to first mock brand
      } else {
        const supabase = await createClient();
        const { data: brandsList } = await supabase
          .from('brands')
          .select('*')
          .eq('organization_id', organizationId)
          .limit(1);
        if (brandsList && brandsList.length > 0) {
          brand = brandsList[0];
        }
      }

      if (trimContent.startsWith('@copy')) {
        const brief = trimContent.replace(/^@copy\s*/, '');
        agentId = 'agent-copy';
        agentName = 'AI Copywriter';

        try {
          const aiResult = await runAgent<any>({
            organizationId,
            agent: 'copy',
            userInput: {
              brief,
              platform: 'linkedin',
              brandName: brand?.name || 'Pulse Retail',
              industry: brand?.industry || 'Modern E-commerce',
              brandVoice: brand?.voice ? JSON.parse(brand.voice) : { tone: brand?.tone },
              audience: 'General audience',
            },
            brandId: brand?.id,
          });

          if (aiResult.success && aiResult.data) {
            const copy = aiResult.data;
            agentResponse = `🤖 **AI Copywriter Reply**:\n\n**Headline**: ${copy.headline}\n\n**Caption Body**:\n${copy.primaryCopy}\n\n**CTA**: ${copy.cta}\n\n**Suggested Tags**: ${copy.hashtags.map((h: string) => `#${h}`).join(' ')}\n\n*P.S. Optimized for checkout conversion. ${copy.optimizationNotes}*`;
          } else {
            agentResponse = `🤖 **AI Copywriter Reply**: Sorry, I failed to write copy: ${aiResult.error}`;
          }
        } catch (copyErr: any) {
          agentResponse = `🤖 **AI Copywriter Reply**: I encountered an error during copywriting execution: ${copyErr.message}`;
        }
      } else if (trimContent.startsWith('@brand')) {
        const query = trimContent.replace(/^@brand\s*/, '');
        agentId = 'agent-brand';
        agentName = 'AI Brand Strategist';

        try {
          const provider = getAIProvider();
          let brandVoiceContext = 'Neutral professional tone.';
          if (brand?.voice) {
            brandVoiceContext = brand.voice;
          }

          const systemPrompt = `You are the Brand Voice Specialist for ${brand?.name || 'Pulse Retail'}. Answer the user's question, strictly conforming to the brand's tone, personality, positioning, and vocabulary rules. Keep it concise (under 3 paragraphs).
          Brand voice rules & positioning metadata:
          ${brandVoiceContext}`;

          const { content: aiAnswer } = await provider.generate(systemPrompt, query);
          agentResponse = `🤖 **AI Brand Strategist Reply**:\n\n${aiAnswer}`;
        } catch (brandErr: any) {
          agentResponse = `🤖 **AI Brand Strategist Reply**: I couldn't audit the voice profile: ${brandErr.message}`;
        }
      }
    }

    // 4. Save AI Response if triggered
    if (agentResponse) {
      const dbAgentMessage: any = {
        organization_id: organizationId,
        sender_id: agentId,
        content: agentResponse,
        recipient_id: recipientId || null,
        channel_id: channelId || 'general',
        file_attachments: [],
      };

      if (!isSupabaseConfigured()) {
        const db = readMockDb();
        const savedAgentMessage = {
          id: `msg-${Math.random().toString(36).substr(2, 9)}`,
          ...dbAgentMessage,
          sender_name: agentName,
          sender_role: 'AI Assistant',
          created_at: new Date().toISOString(),
        };
        db.messages.push(savedAgentMessage);
        writeMockDb(db);
      } else {
        const supabase = await createClient();
        await supabase.from('messages').insert(dbAgentMessage);
      }
    }

    return NextResponse.json({
      success: true,
      data: savedMessage,
      error: null,
    });
  } catch (err: any) {
    console.error('Error sending message:', err.message);
    return NextResponse.json(
      { success: false, data: null, error: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
