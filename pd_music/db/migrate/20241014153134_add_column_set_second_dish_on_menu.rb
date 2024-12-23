class AddColumnSetSecondDishOnMenu < ActiveRecord::Migration[7.0]
  def change
    add_column :menus, :set_second_dish, :integer, limit: 5
  end
end
