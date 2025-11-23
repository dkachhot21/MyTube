import {
  fetchSeasonEpisode,
  fetchByName,
  fetchBySeason,
  fetchById,
  fetchByAlbum,
  fetchByStars,
  fetchAll,
  fetchAllAlbums,
  fetchByUnifiedSearch,
  fetchAllStars,
} from "../repositories/mediaRepository.js";

export async function getAllService(userId, page, limit, sortBy, sortOrder) {
  return await fetchAll(userId, page, limit, sortBy, sortOrder);
}

export async function getBySeason(season, userId) {
  return await fetchBySeason(season, userId);
}

export async function getBySeasonEpisode(season, episode, userId) {
  return await fetchSeasonEpisode(season, episode, userId);
}

export async function getByStars(tags, userId) {
  return await fetchByStars(tags, userId);
}

export async function getByName(name, userId) {
  return await fetchByName(name, userId);
}

export async function getById(Id, userId) {
  return await fetchById(Id, userId);
}

export async function getByAlbum(album, userId, page, limit, sortBy, sortOrder) {
  return await fetchByAlbum(album, userId, page, limit, sortBy, sortOrder);
}

export async function getAllAlbumsService(userId) {
  return await fetchAllAlbums(userId);
}

export async function getByUnifiedSearch(query, userId) {
  return await fetchByUnifiedSearch(query, userId);
}

export async function getAllStarsService(userId) {
  return await fetchAllStars(userId);
}