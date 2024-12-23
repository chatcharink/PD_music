class CreateMenus < ActiveRecord::Migration[7.0]
  def change
    create_table :menus do |t|
      t.string :menu_name
      t.text :menu_picture
      t.text :description
      t.bigint :restaurant_id, limit: 20
      t.integer :price
      t.column :menu_type, "ENUM('main', 'option') DEFAULT 'main'"
      t.json :option_menu
      t.string :option_category, limit: 250
      t.timestamps
    end
  end
end
