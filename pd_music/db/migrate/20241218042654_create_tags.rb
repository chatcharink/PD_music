class CreateTags < ActiveRecord::Migration[7.0]
  def change
    create_table :tags do |t|
      t.string :tag_name
      t.text :description
      t.column :status, "ENUM('active', 'deleted')"
      t.timestamps
    end
  end
end
