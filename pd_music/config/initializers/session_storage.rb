Rails.application.config.session_store :active_record_store,
    :key => '_rd_music_session',
    :expire_after => 1.hour