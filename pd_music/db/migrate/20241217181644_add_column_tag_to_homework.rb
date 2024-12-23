class AddColumnTagToHomework < ActiveRecord::Migration[7.0]
  def change
    add_column :homeworks, :tag_id, :string, limit: 100
  end
end
