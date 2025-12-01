import {
  fetchSeasonEpisode,
  fetchByName,
  fetchBySeason,
  fetchById,
  fetchByAlbum,
  fetchByStars,
  fetchByUnifiedSearch,
  fetchAllStars,
  fetchAll,
  fetchAllAlbums
} from "../repositories/mediaRepository.js";

export async function getByUnifiedSearch(query, userId) {
  return await fetchByUnifiedSearch(query, userId);
}

export async function getAllStarsService(userId) {
  return await fetchAllStars(userId);
}

export async function getBySeasonEpisode(season, episode, userId) {
  return await fetchSeasonEpisode(season, episode, userId);
}

export async function getByName(name, userId) {
  return await fetchByName(name, userId);
}

export async function getBySeason(season, userId) {
  return await fetchBySeason(season, userId);
}

export async function getById(id, userId) {
  return await fetchById(id, userId);
}

export async function getByAlbum(album, userId, page, limit, sortBy, sortOrder, filterType) {
  return await fetchByAlbum(album, userId, page, limit, sortBy, sortOrder, filterType);
}

export async function getByStars(stars, userId) {
  return await fetchByStars(stars, userId);
}

export async function getAllService(userId, page, limit, sortBy, sortOrder, filterType) {
  return await fetchAll(userId, page, limit, sortBy, sortOrder, filterType);
}

export async function getAllAlbumsService(userId) {
  return await fetchAllAlbums(userId);
}