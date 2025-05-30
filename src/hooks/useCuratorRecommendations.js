
      const playlists = res.data.playlists.items || [];

      const curators = playlists
        .filter(p => p?.owner && p.owner.type === 'user')
        .map(p => ({
          userId: p.owner.id,
          displayName: p.owner.display_name || 'Usuario sin nombre',
          profileUrl: p.owner.external_urls.spotify,
          playlistName: p.name,
          playlistImg: p.images?.[0]?.url || null,
        }));

