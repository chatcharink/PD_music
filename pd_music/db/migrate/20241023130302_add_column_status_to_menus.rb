class AddColumnStatusToMenus < ActiveRecord::Migration[7.0]
  def change
    add_column :menus, :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
  end
end
