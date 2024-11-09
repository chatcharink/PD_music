class AddRelationAndFirstLoginToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :relation, :string, limit: 50
    add_column :users, :first_login, :integer, limit: 2
  end
end
