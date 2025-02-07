import * as breaks from './cast.framework.breaks';
import * as events from './cast.framework.events';
import * as messages from './cast.framework.messages';
import * as system from './cast.framework.system';
import * as ui from './cast.framework.ui';

export import breaks = breaks;
export import events = events;
export import ui = ui;
export import system = system;
export import messages = messages;

export as namespace framework;
export enum LoggerLevel {
    DEBUG = 0,
    VERBOSE = 500,
    INFO = 800,
    WARNING = 900,
    ERROR = 1000,
    NONE = 1500,
}

export enum ContentProtection {
    NONE = 'none',
    CLEARKEY = 'clearkey',
    PLAYREADY = 'playready',
    WIDEVINE = 'widevine',
    AES_128 = 'aes_128',
    AES_128_CKP = 'aes_128_ckp',
}

/**
 * Version of CAF receiver SDK.
 */
export const VERSION: string;

/**
 * Manages text tracks.
 * @throws Error If constructor is used directly. The TextTracksManager should
 *     only be accessed by calling {@link framework.PlayerManager#getTextTracksManager}.
 * @see https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.TextTracksManager
 */
export class TextTracksManager {
    /**
     * Adds text tracks to the list.
     * @throws Error If tracks are not available, or trackId is not unique, or add non-text tracks.
     */
    addTracks(tracks: messages.Track[]): void;

    /**
     * Creates a text track.
     */
    createTrack(): messages.Track;

    /**
     * Gets all active text ids.
     */
    getActiveIds(): number[];

    /**
     * Gets all active text tracks.
     */
    getActiveTracks(): messages.Track[];

    /**
     * Returns the current text track style.
     */
    getTextTracksStyle(): messages.TextTrackStyle | undefined;

    /**
     * Gets text track by id.
     */
    getTrackById(id: number): messages.Track;

    /**
     * Returns all text tracks.
     */
    getTracks(): messages.Track[];

    /**
     * Gets text tracks by language.
     */
    getTracksByLanguage(language: string): messages.Track[];

    /**
     * Sets text tracks to be active by id.
     */
    setActiveByIds(newIds: number[]): void;

    /**
     * Sets text tracks to be active by language.
     */
    setActiveByLanguage(language: string): void;

    /**
     * Sets text track style.
     */
    setTextTrackStyle(style: messages.TextTrackStyle): void;
}

/**
 * QueueManager exposes several queue manipulation APIs to developers.
 * @throws Error If constructor is used directly. The QueueManager should only
 *     be accessed by calling cast.framework.PlayerManager#getQueueManager.
 * @see https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.QueueManager
 */
export class QueueManager {
    /**
     * Returns the current queue item.
     */
    getCurrentItem(): messages.QueueItem | null;

    /**
     * Returns the index of the current queue item.
     */
    getCurrentItemIndex(): number;

    /**
     * Returns the queue items.
     */
    getItems(): messages.QueueItem[];

    /**
     * Inserts items into the queue.
     */
    insertItems(items: messages.QueueItem[], insertBefore?: number): void;

    /**
     * Removes items from the queue.
     */
    removeItems(itemIds: number[]): void;

    /**
     * Sets whether to limit the number of queue items to be reported in Media Status (default is true).
     */
    setQueueStatusLimit(limitQueueItemsInStatus: boolean): void;

    /**
     * Updates existing queue items by matching itemId.
     */
    updateItems(items: messages.QueueItem[]): void;
}

/**
 * Base implementation of a queue.
 */
export class QueueBase {
    /**
     * Fetches a window of items using the specified item id as reference; called by the receiver MediaManager when it needs more queue items;
     *  often as a request from senders. If only one of nextCount and prevCount is non-zero; fetchItems should only return items after or before
     *  the reference item; if both nextCount and prevCount are non-zero; a window of items including the reference item should be returned.
     */
    fetchItems(
        itemId: number,
        nextCount: number,
        prevCount: number,
    ): messages.QueueItem[] | Promise<messages.QueueItem[]>;

    /**
     * Initializes the queue with the requestData. This is called when a new LOAD request comes in to the receiver.
     * If this returns or resolves to null; our default queueing implementation will create a queue based on queueData.items or the single media
     *  in the load request data.
     */
    initialize(requestData: messages.LoadRequestData): messages.QueueData | Promise<messages.QueueData>;

    /**
     * Returns next items after the reference item; often the end of the current queue; called by the receiver MediaManager.
     */
    nextItems(itemId?: number): messages.QueueItem[] | Promise<messages.QueueItem[]>;

    /**
     * Sets the current item with the itemId; called by the receiver MediaManager when it changes the current playing item.
     */
    onCurrentItemIdChanged(itemId: number): void;

    /**
     * A callback for informing the following items have been inserted into the receiver queue in this session.
     *  A cloud based implementation can optionally choose to update its queue based on the new information.
     */
    onItemsInserted(items: messages.QueueItem[], insertBefore?: number): void;

    /**
     * A callback for informing the following items have been removed from the receiver queue in this session.
     * A cloud based implementation can optionally choose to update its queue based on the new information.
     */
    onItemsRemoved(itemIds: number[]): void;

    /**
     * Returns previous items before the reference item; often at the beginning of the queue; called by the receiver MediaManager.
     */
    prevItems(itemId?: number): messages.QueueItem[] | Promise<messages.QueueItem[]>;

    /**
     * Shuffles the queue and returns new queue items. Returns null if the operation is not supported.
     */
    shuffle(): messages.QueueItem[] | Promise<messages.QueueItem[]>;
}

// So we can have some auxiliary private types.
export {};
type MessageInterceptor<MessageType> =
    | ((data: MessageType) => MessageType | messages.ErrorData)
    | ((data: MessageType) => Promise<MessageType | messages.ErrorData>)
    | ((data: MessageType) => null)
    | null;

interface MessageEventToMessageTypeMap {
    [messages.MessageType.CLOUD_STATUS]: messages.CloudMediaStatus;
    [messages.MessageType.CUSTOM_COMMAND]: messages.CustomCommandRequestData;
    [messages.MessageType.DISPLAY_STATUS]: messages.DisplayStatusRequestData;
    [messages.MessageType.EDIT_AUDIO_TRACKS]: messages.EditAudioTracksRequestData;
    [messages.MessageType.EDIT_TRACKS_INFO]: messages.EditTracksInfoRequestData;
    [messages.MessageType.FOCUS_STATE]: messages.FocusStateRequestData;
    [messages.MessageType.GET_STATUS]: messages.GetStatusRequestData;
    [messages.MessageType.LOAD]: messages.LoadRequestData;
    [messages.MessageType.LOAD_BY_ENTITY]: messages.LoadByEntityRequestData;
    [messages.MessageType.MEDIA_STATUS]: messages.MediaStatus;
    [messages.MessageType.PRECACHE]: messages.PrecacheRequestData;
    [messages.MessageType.PRELOAD]: messages.PreloadRequestData;
    [messages.MessageType.QUEUE_CHANGE]: messages.QueueChange;
    [messages.MessageType.QUEUE_GET_ITEMS]: messages.GetItemsInfoRequestData;
    [messages.MessageType.QUEUE_GET_ITEM_RANGE]: messages.FetchItemsRequestData;
    [messages.MessageType.QUEUE_INSERT]: messages.QueueInsertRequestData;
    [messages.MessageType.QUEUE_ITEMS]: messages.ItemsInfo;
    [messages.MessageType.QUEUE_ITEM_IDS]: messages.QueueIds;
    [messages.MessageType.QUEUE_LOAD]: messages.QueueLoadRequestData;
    [messages.MessageType.QUEUE_REMOVE]: messages.QueueRemoveRequestData;
    [messages.MessageType.QUEUE_REORDER]: messages.QueueReorderRequestData;
    [messages.MessageType.QUEUE_UPDATE]: messages.QueueUpdateRequestData;
    [messages.MessageType.RESUME_SESSION]: messages.ResumeSessionRequestData;
    [messages.MessageType.SEEK]: messages.SeekRequestData;
    [messages.MessageType.SESSION_STATE]: messages.StoreSessionRequestData;
    [messages.MessageType.SET_CREDENTIALS]: messages.SetCredentialsRequestData;
    [messages.MessageType.SET_PLAYBACK_RATE]: messages.SetPlaybackRateRequestData;
    [messages.MessageType.SET_VOLUME]: messages.VolumeRequestData;
    [messages.MessageType.STORE_SESSION]: messages.StoreSessionRequestData;
    [messages.MessageType.USER_ACTION]: messages.UserActionRequestData;
}

/**
 * Controls and monitors media playback.
 * @throws Error If constructor is used directly. The PlayerManager should only
 *         be accessed by calling {@link framework.CastReceiverContext#getPlayerManager}.
 * @see https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.PlayerManager
 */
export class PlayerManager {
    /**
     * Adds an event listener for events proxied from the @see{@link events.MediaElementEvent}.
     * See {@link https://dev.w3.org/html5/spec-preview/media-elements.html#mediaevents} for more information.
     */
    addEventListener(
        eventType:
            | events.EventType.ABORT
            | events.EventType.ABORT[]
            | events.EventType.CAN_PLAY
            | events.EventType.CAN_PLAY[]
            | events.EventType.CAN_PLAY_THROUGH
            | events.EventType.CAN_PLAY_THROUGH[]
            | events.EventType.DURATION_CHANGE
            | events.EventType.DURATION_CHANGE[]
            | events.EventType.EMPTIED
            | events.EventType.EMPTIED[]
            | events.EventType.ENDED
            | events.EventType.ENDED[]
            | events.EventType.LOADED_DATA
            | events.EventType.LOADED_DATA[]
            | events.EventType.LOADED_METADATA
            | events.EventType.LOADED_METADATA[]
            | events.EventType.LOAD_START
            | events.EventType.LOAD_START[]
            | events.EventType.PLAY
            | events.EventType.PLAY[]
            | events.EventType.PLAYING
            | events.EventType.PLAYING[]
            | events.EventType.PROGRESS
            | events.EventType.PROGRESS[]
            | events.EventType.RATE_CHANGE
            | events.EventType.RATE_CHANGE[]
            | events.EventType.SEEKED
            | events.EventType.SEEKED[]
            | events.EventType.SEEKING
            | events.EventType.SEEKING[]
            | events.EventType.STALLED
            | events.EventType.STALLED[]
            | events.EventType.TIME_UPDATE
            | events.EventType.TIME_UPDATE[]
            | events.EventType.SUSPEND
            | events.EventType.SUSPEND[]
            | events.EventType.WAITING
            | events.EventType.WAITING[],
        eventListener: MediaElementEventHandler,
    ): void;

    /**
     * Adds an event listener for the pause player event. Fired when playback is paused. This event is forwarded from the MediaElement.
     */
    addEventListener(
        eventType: events.EventType.PAUSE | events.EventType.PAUSE[],
        eventListener: PauseEventHandler,
    ): void;

    /**
     * Adds an event listener for the bitrate changed player event.
     * Fired when the bitrate of the playing media changes
     * (such as when an active track is changed,
     * or when a different bitrate is chosen in response to network conditions).
     */
    addEventListener(
        eventType: events.EventType.BITRATE_CHANGED | events.EventType.BITRATE_CHANGED[],
        eventListener: BitrateChangedEventHandler,
    ): void;

    /**
     * Adds an event listener for events related to breaks.
     */
    addEventListener(
        eventType:
            | events.EventType.BREAK_STARTED
            | events.EventType.BREAK_STARTED[]
            | events.EventType.BREAK_ENDED
            | events.EventType.BREAK_ENDED[]
            | events.EventType.BREAK_CLIP_LOADING
            | events.EventType.BREAK_CLIP_LOADING[]
            | events.EventType.BREAK_CLIP_STARTED
            | events.EventType.BREAK_CLIP_STARTED[]
            | events.EventType.BREAK_CLIP_ENDED
            | events.EventType.BREAK_CLIP_ENDED[],
        eventListener: BreaksEventHandler,
    ): void;

    /**
     * Adds an event listener for the buffering player event. Fired when playback has either stopped due to buffering, or started again after buffering has finished.
     */
    addEventListener(
        eventType: events.EventType.BUFFERING | events.EventType.BUFFERING[],
        eventListener: BufferingEventHandler,
    ): void;

    /**
     * Adds an event listener for the cache loaded player event. Fired when content pre-cached by fastplay has finished loading.
     */
    addEventListener(
        eventType: events.EventType.CACHE_LOADED | events.EventType.CACHE_LOADED[],
        eventListener: CacheLoadedEventHandler,
    ): void;

    /**
     * Adds an event listener for the cache hit and cache inserted player events.
     */
    addEventListener(
        eventType:
            | events.EventType.CACHE_HIT
            | events.EventType.CACHE_HIT[]
            | events.EventType.CACHE_INSERTED
            | events.EventType.CACHE_INSERTED[],
        eventListener: CacheItemEventHandler,
    ): void;

    /**
     * Adds an event listener for the clip ended player event. Fired when any clip ends.
     * This includes break clips and main content clips between break clips.
     * If you want to see when a break clip ends, you should use @see{@link events.EventType.BREAK_CLIP_ENDED}.
     * If you want to see when the media is completely done playing, you should use @see{@link events.EventType.MEDIA_FINISHED}.
     */
    addEventListener(
        eventType: events.EventType.CLIP_ENDED | events.EventType.CLIP_ENDED[],
        eventListener: ClipEndedEventHandler,
    ): void;

    /**
     * Adds an event listener for the EMSG player event. Fired when an emsg is found in a segment. This will only be fired for DASH content
     */
    addEventListener(eventType: events.EventType.EMSG | events.EventType.EMSG[], eventListener: EmsgEventHandler): void;

    /**
     * Adds an event listener for the pause player event. Fired when an error occurs.
     */
    addEventListener(
        eventType: events.EventType.ERROR | events.EventType.ERROR[],
        eventListener: ErrorEventHandler,
    ): void;

    /**
     * Adds an event listener for the ID3 player event. Fired when an ID3 tag is encountered. This will only be fired for HLS content.
     */
    addEventListener(eventType: events.EventType.ID3 | events.EventType.ID3[], eventListener: Id3EventHandler): void;

    /**
     * Adds an event listener for the media status player event. Fired before an outgoing message is sent containing current media status.
     */
    addEventListener(
        eventType: events.EventType.MEDIA_STATUS | events.EventType.MEDIA_STATUS[],
        eventListener: MediaStatusEventHandler,
    ): void;

    /**
     * Adds an event listener for the custom state player event. Fired when an outgoing custom state message is sent.
     */
    addEventListener(
        eventType: events.EventType.CUSTOM_STATE | events.EventType.CUSTOM_STATE[],
        eventListener: CustomStateEventHandler,
    ): void;

    /**
     * Adds an event listener for the media information changed player event. Fired if the media information is changed during playback.
     * For example when playing a live radio and the track metadata changed.
     */
    addEventListener(
        eventType: events.EventType.MEDIA_INFORMATION_CHANGED | events.EventType.MEDIA_INFORMATION_CHANGED[],
        eventListener: MediaInformationChangedEventHandler,
    ): void;

    /**
     * Adds an event listener for the media finished player event. Fired when the media has completely finished playing.
     * This includes the following cases: there is nothing left in the stream to play, user has requested a stop, or an error has occurred.
     * When queueing is used, this event will trigger once for each queue item that finishes.
     */
    addEventListener(
        eventType: events.EventType.MEDIA_FINISHED | events.EventType.MEDIA_FINISHED[],
        eventListener: MediaFinishedEventHandler,
    ): void;

    /**
     * Adds an event listener for loading player events.
     */
    addEventListener(
        eventType:
            | events.EventType.PLAYER_PRELOADING
            | events.EventType.PLAYER_PRELOADING[]
            | events.EventType.PLAYER_PRELOADING_CANCELLED
            | events.EventType.PLAYER_PRELOADING_CANCELLED[]
            | events.EventType.PLAYER_LOAD_COMPLETE
            | events.EventType.PLAYER_LOAD_COMPLETE[]
            | events.EventType.PLAYER_LOADING
            | events.EventType.PLAYER_LOADING[],
        eventListener: LoadEventHandler,
    ): void;

    /**
     * Adds an event listener for the media finished player event. Fired when the media has completely finished playing.
     * This includes the following cases: there is nothing left in the stream to play, user has requested a stop, or an error has occurred.
     * When queueing is used, this event will trigger once for each queue item that finishes.
     */
    addEventListener(
        eventType: events.EventType.SEGMENT_DOWNLOADED | events.EventType.SEGMENT_DOWNLOADED[],
        eventListener: SegmentDownloadedEventHandler,
    ): void;

    /**
     * Adds an event listener for request events made to the receiver.
     */
    addEventListener(
        eventType:
            | events.EventType.REQUEST_SEEK
            | events.EventType.REQUEST_SEEK[]
            | events.EventType.REQUEST_LOAD
            | events.EventType.REQUEST_LOAD[]
            | events.EventType.REQUEST_STOP
            | events.EventType.REQUEST_STOP[]
            | events.EventType.REQUEST_PAUSE
            | events.EventType.REQUEST_PAUSE[]
            | events.EventType.REQUEST_PRECACHE
            | events.EventType.REQUEST_PRECACHE[]
            | events.EventType.REQUEST_PLAY
            | events.EventType.REQUEST_PLAY[]
            | events.EventType.REQUEST_SKIP_AD
            | events.EventType.REQUEST_SKIP_AD[]
            | events.EventType.REQUEST_PLAY_AGAIN
            | events.EventType.REQUEST_PLAY_AGAIN[]
            | events.EventType.REQUEST_PLAYBACK_RATE_CHANGE
            | events.EventType.REQUEST_PLAYBACK_RATE_CHANGE[]
            | events.EventType.REQUEST_VOLUME_CHANGE
            | events.EventType.REQUEST_VOLUME_CHANGE[]
            | events.EventType.REQUEST_EDIT_TRACKS_INFO
            | events.EventType.REQUEST_EDIT_TRACKS_INFO[]
            | events.EventType.REQUEST_EDIT_AUDIO_TRACKS
            | events.EventType.REQUEST_EDIT_AUDIO_TRACKS[]
            | events.EventType.REQUEST_SET_CREDENTIALS
            | events.EventType.REQUEST_SET_CREDENTIALS[]
            | events.EventType.REQUEST_LOAD_BY_ENTITY
            | events.EventType.REQUEST_LOAD_BY_ENTITY[]
            | events.EventType.REQUEST_USER_ACTION
            | events.EventType.REQUEST_USER_ACTION[]
            | events.EventType.REQUEST_DISPLAY_STATUS
            | events.EventType.REQUEST_DISPLAY_STATUS[]
            | events.EventType.REQUEST_CUSTOM_COMMAND
            | events.EventType.REQUEST_CUSTOM_COMMAND[]
            | events.EventType.REQUEST_FOCUS_STATE
            | events.EventType.REQUEST_FOCUS_STATE[]
            | events.EventType.REQUEST_QUEUE_LOAD
            | events.EventType.REQUEST_QUEUE_LOAD[]
            | events.EventType.REQUEST_QUEUE_INSERT
            | events.EventType.REQUEST_QUEUE_INSERT[]
            | events.EventType.REQUEST_QUEUE_UPDATE
            | events.EventType.REQUEST_QUEUE_UPDATE[]
            | events.EventType.REQUEST_QUEUE_REMOVE
            | events.EventType.REQUEST_QUEUE_REMOVE[]
            | events.EventType.REQUEST_QUEUE_REORDER
            | events.EventType.REQUEST_QUEUE_REORDER[]
            | events.EventType.REQUEST_QUEUE_GET_ITEM_RANGE
            | events.EventType.REQUEST_QUEUE_GET_ITEM_RANGE[]
            | events.EventType.REQUEST_QUEUE_GET_ITEMS
            | events.EventType.REQUEST_QUEUE_GET_ITEMS[]
            | events.EventType.REQUEST_QUEUE_GET_ITEM_IDS
            | events.EventType.REQUEST_QUEUE_GET_ITEM_IDS[],
        eventListener: RequestEventHandler,
    ): void;

    /**
     * Adds an event listener for the live player events.
     */
    addEventListener(
        eventType:
            | events.EventType.LIVE_IS_MOVING_WINDOW_CHANGED
            | events.EventType.LIVE_IS_MOVING_WINDOW_CHANGED[]
            | events.EventType.LIVE_ENDED
            | events.EventType.LIVE_ENDED[],
        eventListener: LiveStatusEventHandler,
    ): void;

    /**
     * Adds an event listener for player events that get the base @see{@link events.Event} in the callback.
     * Includes ALL and CLIP_STARTED
     */
    addEventListener(eventType: events.EventType | events.EventType[], eventListener: EventHandler): void;

    /**
     * Sends a media status message to all senders (broadcast). Applications use this to send a custom state change.
     */
    broadcastStatus(includeMedia?: boolean, requestId?: number, customData?: any, includeQueueItems?: boolean): void;

    getAudioTracksManager(): AudioTracksManager;

    /**
     * @returns current time in sec in currently-playing break clip.
     *    Null, if player is not playing break clip.
     */
    getBreakClipCurrentTimeSec(): number | null;

    /**
     * @returns duration in sec of currently-playing break clip.
     *    Null, if player is not playing break clip.
     */
    getBreakClipDurationSec(): number | null;

    /**
     * Obtain the breaks (Ads) manager.
     */
    getBreakManager(): breaks.BreakManager;

    /**
     * Returns list of breaks.
     */
    getBreaks(): messages.Break[];

    /**
     * Gets current time in sec of current media.
     */
    getCurrentTimeSec(): number;

    /**
     * Gets duration in sec of currently playing media.
     */
    getDurationSec(): number;

    /**
     * @returns live seekable range with start and end time in seconds. The values
     *     are media time based.
     */
    getLiveSeekableRange(): messages.LiveSeekableRange | null;

    /**
     * Gets media information of current media.
     */
    getMediaInformation(): messages.MediaInformation | null;

    /**
     * @returns playback configuration.
     */
    getPlaybackConfig(): PlaybackConfig | null;

    /**
     * Returns current playback rate.
     */
    getPlaybackRate(): number;

    /**
     * Gets player state.
     */
    getPlayerState(): messages.PlayerState;

    /**
     * Get the preferred playback rate. (Can be used on shutdown event to save latest preferred playback rate to a persistent storage;
     *  so it can be used in next session in the cast options).
     */
    getPreferredPlaybackRate(): number;

    /**
     * Get the preferred text track language.
     */
    getPreferredTextLanguage(): string | null;

    /**
     * Obtain QueueManager API.
     */
    getQueueManager(): QueueManager | null;

    getTextTracksManager(): TextTracksManager;

    /**
     * Loads media.
     */
    load(loadRequest: messages.LoadRequestData): Promise<void>;

    /**
     * Pauses currently playing media.
     */
    pause(): void;

    /**
     * Plays currently paused media.
     */
    play(): void;

    /**
     * Requests a text string to be played back locally on the receiver device.
     */
    playString(stringId: messages.PlayStringId, args?: string[]): Promise<messages.ErrorData | null>;

    /**
     * Request Google Assistant to refresh the credentials. Only works if the original credentials came from the assistant.
     */
    refreshCredentials(): Promise<void>;

    /**
     * Removes the event listener added for given player event. If event listener is not added; it will be ignored.
     */
    removeEventListener(eventType: events.EventType | events.EventType[], eventListener: EventHandler): void;

    /**
     * Seeks in current media.
     */
    seek(seekTime: number): void;

    /**
     * Sends an error to a specific sender
     */
    sendError(
        senderId: string,
        requestId: number,
        type: messages.ErrorType,
        reason?: messages.ErrorReason,
        customData?: any,
    ): void;

    /**
     * Send local media request.
     */
    sendLocalMediaRequest(request: messages.RequestData): void;

    /**
     * Sends a media status message to a specific sender.
     */
    sendStatus(
        senderId: string,
        requestId: number,
        includeMedia?: boolean,
        customData?: any,
        includeQueueItems?: boolean,
    ): void;

    /**
     * Sets the IDLE reason. This allows applications that want to force the IDLE state to indicate the reason that made the player going to IDLE state
     * (a custom error; for example). The idle reason will be sent in the next status message. NOTE: Most applications do not need to set this value;
     * it is only needed if they want to make the player go to IDLE in special circumstances and the default idleReason does not reflect their intended
     * behavior.
     */
    setIdleReason(idleReason: messages.IdleReason): void;

    /**
     * Sets MediaElement to use. If Promise of MediaElement is set; media begins playback after Promise is resolved.
     */
    setMediaElement(mediaElement: HTMLMediaElement | Promise<HTMLMediaElement>): void;

    /**
     * Sets media information.
     */
    setMediaInformation(mediaInformation: messages.MediaInformation, opt_broadcast?: boolean): void;

    /**
     * Sets a handler to return or modify PlaybackConfig; for a specific load request. The handler paramaters are the load request data
     * and default playback config for the receiver (provided in the context options). The handler should returns a modified playback config;
     *  or null to prevent the media from playing. The return value can be a promise to allow waiting for data from the server.
     */
    setMediaPlaybackInfoHandler(
        handler: (loadRequestData: messages.LoadRequestData, playbackConfig: PlaybackConfig) => void,
    ): void;

    /**
     * Sets a handler to return the media url for a load request. This handler can be used to avoid having the media content url published as part
     * of the media status. By default the media contentId is used as the content url.
     */
    setMediaUrlResolver(resolver: (loadRequestData: messages.LoadRequestData) => void): void;

    /**
     * Provide an interceptor of incoming and outgoing messages. The interceptor
     * can update the request data, and return updated data, a promise of
     * updated data if need to get more data from the server, or null if the
     * request should not be handled. Note that if load message interceptor is
     * provided, and no interceptor is provided for preload - the load
     * interceptor will be called for preload messages.
     */
    setMessageInterceptor<MessageEvent extends keyof MessageEventToMessageTypeMap>(
        type: MessageEvent,
        interceptor: MessageInterceptor<MessageEventToMessageTypeMap[MessageEvent]>,
    ): void;
    setMessageInterceptor(type: messages.MessageType, interceptor: MessageInterceptor<messages.RequestData>): void;

    /**
     * Sets playback configuration on the PlayerManager.
     */
    setPlaybackConfig(playbackConfig: PlaybackConfig): void;

    /**
     * Set receiver supported media commands.
     * Flags describing which media commands the media player supports:
     * 1  Pause
     * 2  Seek
     * 4  Stream volume
     * 8  Stream mute
     * 16  Skip forward
     * 32  Skip backward
     * Combinations are described as summations; for example, Pause+Seek+StreamVolume+Mute == 15.
     */
    setSupportedMediaCommands(supportedMediaCommands: number, broadcastStatus?: boolean): void;

    /**
     * Remove commands from receiver supported media commands.
     * @param supportedMediaCommands A bitmask of media commands supported by the application.
     * @param broadcastStatus Whether the senders should be notified about the change (if not provided, the senders will be notified).
     */
    removeSupportedMediaCommands(supportedMediaCommands: number, broadcastStatus?: boolean): void;

    /**
     * Add commands to receiver supported media commands.
     * @param supportedMediaCommands A bitmask of media commands supported by the application.
     * @param broadcastStatus Whether the senders should be notified about the change (if not provided, the senders will be notified).
     */
    addSupportedMediaCommands(supportedMediaCommands: number, broadcastStatus?: boolean): void;

    /**
     * Gets the current receiver supported media commands.
     * Should only be called after calling receiver start, otherwise it returns 0.
     * This reflects the current media status. E.g. during ads playback, SEEK might not be supported.
     *
     * @returns A bitmask of media commands supported by the application.
     */
    getCurrentSupportedMediaCommands(): number;

    /**
     * Gets receiver supported media commands. Should only be called after calling receiver start, otherwise it returns 0.
     * This is the static supported media commands set by receiver application.
     * It won't be updated based on current media status.
     *
     * @returns A bitmask of media commands supported by the application.
     */
    getSupportedMediaCommands(): number;

    /**
     * Stops currently playing media.
     */
    stop(): void;
}

/**
 * Configuration to customize playback behavior.
 */
export class PlaybackConfig {
    /**
     * Duration of buffered media in seconds to start buffering.
     */
    autoPauseDuration?: number | undefined;

    /**
     * Duration of buffered media in seconds to start/resume playback after auto-paused due to buffering.
     */
    autoResumeDuration?: number | undefined;

    /**
     * Minimum number of buffered segments to start/resume playback.
     */
    autoResumeNumberOfSegments?: number | undefined;

    /**
     * A function to customize request to get a caption segment.
     */
    captionsRequestHandler?: RequestHandler | undefined;

    /**
     * Initial bandwidth in bits in per second.
     */
    initialBandwidth?: number | undefined;

    /**
     * Custom license data.
     */
    licenseCustomData?: string | undefined;

    /**
     * Handler to process license data. The handler is passed the license data; and returns the modified license data.
     */
    licenseHandler?: BinaryHandler | undefined;

    /**
     * A function to customize request to get a license.
     */
    licenseRequestHandler?: RequestHandler | undefined;

    /**
     * Url for acquiring the license.
     */
    licenseUrl?: string | undefined;

    /**
     * Handler to process manifest data. The handler is passed the manifest,
     * and returns the modified manifest.
     */
    manifestHandler?: ((manifest: string) => string | Promise<string>) | undefined;

    /**
     * A function to customize request to get a manifest.
     */
    manifestRequestHandler?: RequestHandler | undefined;

    /**
     * Preferred protection system to use for decrypting content.
     */
    protectionSystem: ContentProtection;

    /**
     * Handler to process segment data. The handler is passed the segment data; and returns the modified segment data.
     */
    segmentHandler?: BinaryHandler | undefined;

    /**
     * A function to customize request information to get a media segment.
     */
    segmentRequestHandler?: RequestHandler | undefined;

    /**
     * Maximum number of times to retry a network request for a segment.
     */
    segmentRequestRetryLimit?: number | undefined;
}
/**
 * HTTP(s) Request/Response information.
 * @see https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.NetworkRequestInfo
 */
export class NetworkRequestInfo {
    /**
     * The content of the request. Can be used to modify license request body.
     */
    content: Uint8Array | null;

    /**
     * An object containing properties that you would like to send in the header.
     */
    headers: any;

    /**
     * The URL requested.
     */
    url: string | null;

    /**
     * Indicates whether CORS Access-Control requests should be made using credentials such as cookies or authorization headers.
     */
    withCredentials: boolean;
}
/** Cast receiver context options. All options are optionals. */
export class CastReceiverOptions {
    /**
     * Optional map of custom messages namespaces to initialize and their types.
     * Custom messages namespaces need to be initiated before the application started;
     * so it is best to provide the namespaces in the receiver options.
     * (The default type of a message bus is JSON; if not provided here).
     */
    customNamespaces?: any;

    /**
     * If true, the receiver will not set an idle timeout to close receiver if there is no activity.
     * Should only be used for non media apps.
     */
    disableIdleTimeout?: boolean | undefined;

    /**
     * Sender id used for local requests. Default value is 'local'.
     */
    localSenderId?: string | undefined;

    /**
     * Maximum time in seconds before closing an idle sender connection.
     * Setting this value enables a heartbeat message to keep the connection alive.
     * Used to detect unresponsive senders faster than typical TCP timeouts.
     * The minimum value is 5 seconds; there is no upper bound enforced but practically it's minutes before platform TCP timeouts come into play.
     * Default value is 10 seconds.
     */
    maxInactivity?: number | undefined;

    /**
     * Optional media element to play content with. Default behavior is to use the first found media element in the page.
     */
    mediaElement?: HTMLMediaElement | undefined;

    /**
     * Optional playback configuration.
     */
    playbackConfig?: PlaybackConfig | undefined;

    /**
     * If this is true; the watched client stitching break will also be played.
     */
    playWatchedBreak?: boolean | undefined;

    /**
     * Preferred value for player playback rate. It is used if playback rate value is not provided in the load request.
     */
    preferredPlaybackRate?: number | undefined;

    /**
     * Preferred text track language. It is used if no active track is provided in the load request.
     */
    preferredTextLanguage?: string | undefined;

    /**
     * Optional queue implementation.
     */
    queue?: QueueBase | undefined;

    /**
     * Text that represents the application status.
     * It should meet internationalization rules as may be displayed by the sender application.
     */
    statusText?: string | undefined;

    /**
     * A bitmask of media commands supported by the application.
     * LOAD; PLAY; STOP; GET_STATUS must always be supported.
     * If this value is not provided; then PAUSE; SEEK; STREAM_VOLUME; STREAM_MUTE are assumed to be supported too.
     */
    supportedCommands?: number | undefined;

    /**
     * Indicate that MPL should be used for DASH content.
     */
    useLegacyDashSupport?: boolean | undefined;

    /**
     * An integer used as an internal version number.
     * This number is used only to distinguish between receiver releases and higher numbers do not necessarily have to represent newer releases.
     */
    versionCode?: number | undefined;
}

/** Manages loading of underlying libraries and initializes underlying cast receiver SDK. */
export class CastReceiverContext {
    /** Returns the CastReceiverContext singleton instance. */
    static getInstance(): CastReceiverContext;

    /**
     * Sets message listener on custom message channel.
     */
    addCustomMessageListener(namespace: string, listener: SystemEventHandler): void;

    /**
     * Add listener to cast system events.
     */
    addEventListener(type: system.EventType | system.EventType[], handler: SystemEventHandler): void;

    /**
     * Checks if the given media params of video or audio streams are supported by the platform.
     */
    canDisplayType(mimeType: string, codecs?: string, width?: number, height?: number, framerate?: number): boolean;

    /**
     * Provides application information once the system is ready, otherwise it will be null.
     */
    getApplicationData(): system.ApplicationData | null;

    /**
     * Provides device capabilities information once the system is ready; otherwise it will be null.
     * If an empty object is returned; the device does not expose any capabilities information.
     */
    getDeviceCapabilities(): any;

    /**
     * Get Player instance that can control and monitor media playback.
     */
    getPlayerManager(): PlayerManager;

    /**
     * Get a sender by sender id
     */
    getSender(senderId: string): system.Sender | null;

    /**
     * Gets a list of currently-connected senders.
     */
    getSenders(): system.Sender[];

    /**
     * Reports if the cast application's HDMI input is in standby.
     */
    getStandbyState(): system.StandbyState;

    /**
     * Provides application information about the system state.
     */
    getSystemState(): system.SystemState;

    /**
     * Reports if the cast application is the HDMI active input.
     * @returns Whether the application is the HDMI active input. If it can not
     *     be determined, because the TV does not support CEC commands, for
     *     example, the value returned is UNKNOWN.
     */
    getVisibilityState(): system.VisibilityState;

    /**
     * When the application calls start; the system will send the ready event to indicate
     * that the application information is ready and the application can send messages as soon as there is one sender connected.
     */
    isSystemReady(): boolean;

    /**
     * Start loading player js. This can be used to start loading the players js code in early stage of starting the receiver before calling start.
     * This function is a no-op if players were already loaded (start was called).
     */
    loadPlayerLibraries(useLegacyDashSupport?: boolean): void;

    /**
     * Remove a message listener on custom message channel.
     */
    removeCustomMessageListener(namespace: string, listener: SystemEventHandler): void;

    /**
     * Remove listener to cast system events.
     */
    removeEventListener(type: system.EventType, handler: SystemEventHandler): void;

    /**
     * Sends a message to a specific sender or broadcasts it to all connected senders (to broadcast pass undefined as a senderId).
     */
    sendCustomMessage(namespace: string, senderId: string | undefined, message: any): void;

    /**
     * This function should be called in response to the feedbackstarted event if the application
     * add debug state information to log in the feedback report.
     * It takes in a parameter ‘message’ that is a string that represents the debug information that the application wants to log.
     */
    sendFeedbackMessage(feedbackMessage: string): void;

    /**
     * Sets the application state. The application should call this when its state changes.
     * If undefined or set to an empty string; the value of the Application Name established during application
     * registration is used for the application state by default.
     */
    setApplicationState(statusText: string): void;

    /**
     * Sets the receiver inactivity timeout.
     * It is recommended to set the maximum inactivity value when calling Start and not changing it.
     * This API is just provided for development/debugging purposes.
     */
    setInactivityTimeout(maxInactivity: number): void;

    /**
     * Sets the log verbosity level.
     */
    setLoggerLevel(level: LoggerLevel): void;

    /**
     * Initializes system manager and media manager; so that receiver app can receive requests from senders.
     */
    start(options?: CastReceiverOptions): CastReceiverContext;

    /**
     * Shutdown receiver application.
     */
    stop(): void;
}

/**
 * Manages audio tracks.
 * @throws Error If constructor is used directly. The AudioTracksManager should
 *     only be accessed by calling {@link framework.PlayerManager#getAudioTracksManager}
 *
 * @see https://developers.google.com/cast/docs/reference/web_receiver/cast.framework.AudioTracksManager
 */
export class AudioTracksManager {
    /**
     * Gets the active audio id.
     */
    getActiveId(): number | undefined;
    /**
     * Gets the active audio track.
     */
    getActiveTrack(): messages.Track | undefined;
    /**
     * Gets audio track by id.
     * @param id
     * @throws Error  If id is not available or invalid.
     */
    getTrackById(id: number): messages.Track | undefined;
    getTracks(): messages.Track[];
    getTracksByLanguage(language: string): messages.Track[];
    setActiveById(id: number): void;
    setActiveByLanguage(language: string): void;
}
