export const getAllStars = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/media/stars`);
        if (!response.ok) {
            throw new Error('Failed to fetch stars');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching stars:', error);
        return [];
    }
};
