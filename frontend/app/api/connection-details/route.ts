import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';
import { RoomConfiguration } from '@livekit/protocol';
import { RoomServiceClient } from 'livekit-server-sdk';

type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

async function handleCreateConnection(agentName?: string) {
  if (LIVEKIT_URL === undefined) {
    throw new Error('LIVEKIT_URL is not defined');
  }
  if (API_KEY === undefined) {
    throw new Error('LIVEKIT_API_KEY is not defined');
  }
  if (API_SECRET === undefined) {
    throw new Error('LIVEKIT_API_SECRET is not defined');
  }

  // Generate participant token
  const participantName = 'user';
  const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;
  const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

  const participantToken = await createParticipantToken(
    { identity: participantIdentity, name: participantName },
    roomName,
    agentName
  );

  // Dispatch agent if specified
  if (agentName) {
    try {
      const roomService = new RoomServiceClient(LIVEKIT_URL, API_KEY, API_SECRET);
      await roomService.dispatchAgent({
        room: roomName,
        agentName: agentName,
      });
      console.log(`Dispatched agent ${agentName} to room ${roomName}`);
    } catch (error) {
      console.error('Failed to dispatch agent:', error);
      // Continue anyway - agent might connect later
    }
  }

  // Return connection details
  const data: ConnectionDetails = {
    serverUrl: LIVEKIT_URL,
    roomName,
    participantToken: participantToken,
    participantName,
  };
  const headers = new Headers({
    'Cache-Control': 'no-store',
  });
  return NextResponse.json(data, { headers });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const agentName = url.searchParams.get('agentName') ?? undefined;
    return await handleCreateConnection(agentName);
  } catch (error) {
    console.error(error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const agentName: string = body?.room_config?.agents?.[0]?.agent_name;
    return await handleCreateConnection(agentName);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(
  userInfo: AccessTokenOptions,
  roomName: string,
  agentName?: string
): Promise<string> {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);

  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [{ agentName }],
    });
  }

  return at.toJwt();
}
