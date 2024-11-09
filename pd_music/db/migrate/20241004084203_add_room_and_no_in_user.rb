class AddRoomAndNoInUser < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :room, :bigint, limit: 20
    add_column :users, :student_no, :bigint, limit: 20
  end
end
