'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Menambahkan referensi ke AnimeDetail
    await queryInterface.addColumn('UserLikes', 'anime_detail_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'AnimeDetails',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('UserLikes', 'key', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });
  }
};
