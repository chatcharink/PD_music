class CreateComments < ActiveRecord::Migration[7.0]
  def change
    create_table :comments do |t|
      t.string :subject, limit: 150
      t.text :comment
      t.integer :rating, limit: 2
      t.bigint :student_id, limit: 20
      t.bigint :comment_by, limit: 20
      t.string :comment_type, limit: 50
      t.timestamps
    end
  end
end
