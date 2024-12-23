class CreateRestaurants < ActiveRecord::Migration[7.0]
  def change
    create_table :restaurants do |t|
      t.string :restaurant_name
      t.text :restaurant_picture
      t.integer :restaurant_category, limit: 5
      t.column :status, "ENUM('active', 'inactive', 'deleted') DEFAULT 'active'"
      t.string :telephone_no, limit: 20
      t.string :line_id, limit: 50
      t.timestamps
    end
  end
end
