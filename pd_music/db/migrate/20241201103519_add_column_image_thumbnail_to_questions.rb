class AddColumnImageThumbnailToQuestions < ActiveRecord::Migration[7.0]
  def change
    add_column :questions, :image_thumbnail, :string, limit: 50
    add_column :questions, :answer_image_thumbnail, :string, limit: 50
  end
end
