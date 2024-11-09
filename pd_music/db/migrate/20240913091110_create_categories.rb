class CreateCategories < ActiveRecord::Migration[7.0]
  def change
    create_table :categories do |t|
      t.string :name_th, limit: 150
      t.string :name_en, limit: 150
      t.string :color_code, limit: 20
      t.timestamps
    end
  end
end
