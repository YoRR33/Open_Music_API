class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(
        message.content.toString()
      );

      // console.log("📦 Parsed Message:", parsedMessage);
      // console.log("✅ playlistId:", playlistId);
      // console.log("✅ targetEmail:", targetEmail);

      if (!playlistId) {
        throw new Error("Tidak ada playlist id");
      }

      if (!targetEmail) {
        throw new Error("Tidak ada target email");
      }

      // const playlists = await this._playlistService.getPlaylistSong(playlistId);

      const playlist = await this._playlistService.getPlaylistById(playlistId);
      const songInPlaylist =
        await this._playlistService.getSongsFromPlaylist(playlistId);

      const playlistSong = {
        Playlist: {
          id: playlist.id,
          name: playlist.name,
          owner: playlist.username,
          song: songInPlaylist,
        },
      };

      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlistSong)
      );

      console.log(result);
    } catch (error) {
      console.error("Error processing message:", error.message);
    }
  }
}
module.exports = Listener;
