class AddColumnStatusToCategory < ActiveRecord::Migration[7.0]
  def change
    add_column :categories, :status, "ENUM('active', 'deleted')"
  end
end
