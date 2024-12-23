class AddPriorityColumnInPermission < ActiveRecord::Migration[7.0]
  def change
    add_column :permissions, :priority, :bigint, limit: 20
  end
end
