// StoryChunk model: stores embedded chunks for retrieval (RAG)
export const initStoryChunkModel = (sequelize) => {
  const { DataTypes } = sequelize.Sequelize;
  const StoryChunk = sequelize.define('StoryChunk', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    brewId: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true
    },
    chunkId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    names: {
      // Optional entity names detected; simple array in JSON
      type: DataTypes.JSON,
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    embedding: {
      // Store as JSON array of floats to keep SQLite simple
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    indexes: [
      { fields: ['brewId'] },
      { unique: true, fields: ['brewId', 'chunkId'] }
    ]
  });

  return StoryChunk;
};
