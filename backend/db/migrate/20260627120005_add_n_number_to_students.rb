class AddNNumberToStudents < ActiveRecord::Migration[8.1]
  def change
    add_column :students, :n_number, :string
  end
end
