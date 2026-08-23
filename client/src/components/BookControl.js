import React, { Component } from 'react';
import axios from 'axios';
import BookList from './BookList';
import NewBookForm from './NewBookForm';
import BookDetail from './BookDetail';
import AddBook from './AddBook';
import EditBookForm from './EditBookForm';

class BookControl extends Component {

    constructor(props)  {
        super(props);
        this.state = {
            formVisibleOnPage: false,
            actualBookList: [],
            selectedBook: null,
            editBook: false,
        };
    }

    componentDidMount(){
        axios.get('http://44.198.164.158:5000/api/books')
            .then(res =>{
                this.setState({
                    actualBookList: res.data
                })
            })
    }

    handleEditBookClick = () =>{
        this.setState({
            editBook: true
        })
    }

    handleBorrowButtonClick = (id) =>{
        const borrowedBook = this.state.actualBookList.filter(book => book._id === id)[0];
        borrowedBook.copies = borrowedBook.copies - 1;
        if (borrowedBook.copies <= 0) {
            borrowedBook.copies = "No copies available"
        }
        this.setState({
            selectedBook: borrowedBook
        })
    }

    handleClick = () => {
        if(this.state.editBook){
            this.setState({
                editBook: false
            })
        }else if (this.state.selectedBook != null){
            this.setState({
                formVisibleOnPage: false,
                selectedBook: null
            });
        }else {
            this.setState(prevState => ({
                formVisibleOnPage: !prevState.formVisibleOnPage
            }));
        }
    }

    // Method to handle adding a new book
    handleAddingNewBook = (newBook) => {
        axios.post('http://44.198.164.158:5000/api/books', newBook)
            .then(res => {
            this.setState(prevState => ({
                actualBookList: [...prevState.actualBookList, res.data],
                formVisibleOnPage: false
            }));
        })
        .catch(error => {
            console.log(error);
        });
    };

    handleDeletingBook = (id) =>{
        axios.delete('http://44.198.164.158:5000/api/books/'+id)
            .then(res => console.log(res.data))
            .catch((error) =>{
                console.log(error)
            })
        this.setState({
            actualBookList: this.state.actualBookList.filter(book => book._id !== id),
            formVisibleOnPage: false,
            selectedBook: null
        })
    }

    // Method to handle click event on a book
    handleChangingSelectedBook = (id) => {
        const selectedBook = this.state.actualBookList.filter(book => book._id === id)[0];
        this.setState({selectedBook: selectedBook});
    }

    handleEditingBook = (editedBook) =>{
        axios.put('http://44.198.164.158:5000/api/books/' + this.state.selectedBook._id, editedBook)
            .then(res =>console.log(res.data))

        this.setState({
            editBook: false,
            formVisibleOnPage: false
        })
        window.location = '/';
    }

    render() {
        let currentlyVisibleState = null;
        let buttonText = null;
        if(this.state.editBook){
            currentlyVisibleState = <EditBookForm book={this.state.selectedBook} onEditBook={this.handleEditingBook} />
            buttonText = "Back to book detail"
        }else if (this.state.selectedBook != null){
            currentlyVisibleState = <BookDetail book={this.state.selectedBook} onBorrowButtonClick={this.handleBorrowButtonClick} onDeleteBook={this.handleDeletingBook} onEditBookClick={this.handleEditBookClick}/>
            buttonText = "Back to catalog"
        }else if (this.state.formVisibleOnPage){
            currentlyVisibleState = <NewBookForm onNewBookCreation={this.handleAddingNewBook} />
            buttonText = "Back to catalog"
        }else{
            currentlyVisibleState = <BookList bookList={this.state.actualBookList} onBookSelection={this.handleChangingSelectedBook} />
            buttonText = "Add a book"
        }
        return (
            <React.Fragment>
                <AddBook
                    buttonText={buttonText}
                    whenButtonClicked={this.handleClick}
                />
                {currentlyVisibleState}
            </React.Fragment>
        )
    }
}

export default BookControl;
